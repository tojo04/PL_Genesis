import * as LitJsSdk from 'lit-js-sdk';
import { decryptJsonWithAesGcm, base64Utils } from './cryptoAesGcm.js';
import {
  appendAuditEvent,
  getMetadataRecord,
  markRecordRevoked,
  upsertMetadataRecord,
} from './metadataIndex.js';
import { readEnv } from './env.js';

let litClient;

function getChain() {
  return readEnv('VITE_LIT_CHAIN', 'ethereum');
}

async function getLitClient() {
  if (litClient) {
    return litClient;
  }

  litClient = new LitJsSdk.LitNodeClient({
    litNetwork: readEnv('VITE_LIT_NETWORK', 'cayenne'),
  });

  await litClient.connect();
  return litClient;
}

async function getAuthSig() {
  const configuredAuthSig = readEnv('VITE_LIT_AUTH_SIG_JSON', '');
  if (configuredAuthSig) {
    return JSON.parse(configuredAuthSig);
  }

  return LitJsSdk.checkAndSignAuthMessage({ chain: getChain() });
}

export function buildAccessControlConditions(granteeWallet) {
  return [
    {
      contractAddress: '',
      standardContractType: '',
      chain: getChain(),
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: granteeWallet,
      },
    },
  ];
}

async function wrapSymmetricKey({ rawKeyBytes, accessControlConditions }) {
  const client = await getLitClient();
  const authSig = await getAuthSig();

  const encryptedSymmetricKey = await client.saveEncryptionKey({
    accessControlConditions,
    symmetricKey: rawKeyBytes,
    authSig,
    chain: getChain(),
  });

  return LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16');
}

async function unwrapSymmetricKey({ encryptedSymmetricKeyHex, accessControlConditions }) {
  const client = await getLitClient();
  const authSig = await getAuthSig();

  return client.getEncryptionKey({
    accessControlConditions,
    toDecrypt: encryptedSymmetricKeyHex,
    chain: getChain(),
    authSig,
  });
}

export async function grantAccessPolicy({ wallet, purpose, durationHours, recordCid, symmetricKeyBase64 }) {
  const expiresAt = new Date(Date.now() + Number(durationHours) * 60 * 60 * 1000).toISOString();
  const accessControlConditions = buildAccessControlConditions(wallet);

  const policy = {
    id: `${recordCid}:${wallet}:${Date.now()}`,
    chain: getChain(),
    granteeWallet: wallet,
    purpose,
    durationHours: Number(durationHours),
    expiresAt,
    accessControlConditions,
  };

  let wrappedSymmetricKey = null;
  if (symmetricKeyBase64) {
    const rawKeyBytes = base64Utils.fromBase64(symmetricKeyBase64);
    wrappedSymmetricKey = await wrapSymmetricKey({
      rawKeyBytes,
      accessControlConditions,
    });
  }

  upsertMetadataRecord({
    recordCid,
    policy,
    wrappedSymmetricKey,
    revoked: false,
  });
  appendAuditEvent(recordCid, {
    action: 'grant',
    granteeWallet: wallet,
    purpose,
    expiresAt,
  });

  return {
    action: 'grant',
    recordCid,
    policy,
    wrappedSymmetricKey,
  };
}

export async function revokeAccessPolicy({ wallet, recordCid }) {
  const record = getMetadataRecord(recordCid);
  if (!record) {
    throw new Error(`No metadata found for record CID ${recordCid}`);
  }

  markRecordRevoked(recordCid, `revoked-by-${wallet || 'unknown'}`);

  return {
    action: 'revoke',
    recordCid,
    revokedAt: new Date().toISOString(),
  };
}

export async function decryptWithPolicy({ recordCid, envelope }) {
  const record = getMetadataRecord(recordCid);
  if (!record) {
    throw new Error(`No policy metadata found for CID ${recordCid}`);
  }

  if (record.revoked) {
    appendAuditEvent(recordCid, { action: 'decrypt-denied', reason: 'revoked' });
    throw new Error('Access revoked for this record');
  }

  if (new Date(record.policy.expiresAt).getTime() < Date.now()) {
    appendAuditEvent(recordCid, { action: 'decrypt-denied', reason: 'expired' });
    throw new Error('Policy has expired');
  }

  if (!record.wrappedSymmetricKey) {
    throw new Error('No wrapped symmetric key found for this record');
  }

  const rawKey = await unwrapSymmetricKey({
    encryptedSymmetricKeyHex: record.wrappedSymmetricKey,
    accessControlConditions: record.policy.accessControlConditions,
  });

  const payload = await decryptJsonWithAesGcm({
    ciphertext: envelope.ciphertext,
    iv: envelope.iv,
    rawKey,
  });

  appendAuditEvent(recordCid, {
    action: 'decrypt-approved',
    granteeWallet: record.policy.granteeWallet,
  });

  return payload;
}
