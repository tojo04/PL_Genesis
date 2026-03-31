import { Web3Storage } from 'web3.storage';
import { encryptJsonWithAesGcm, base64Utils } from './cryptoAesGcm.js';
import { appendAuditEvent, upsertMetadataRecord } from './metadataIndex.js';
import { readEnv } from './env.js';

function requireToken() {
  const token = readEnv('VITE_STORACHA_TOKEN', '');
  if (!token) {
    throw new Error('Missing VITE_STORACHA_TOKEN for Storacha/Filecoin upload');
  }
  return token;
}

function getGatewayUrl(cid) {
  const gatewayBase = readEnv('VITE_STORACHA_GATEWAY', 'https://w3s.link/ipfs');
  return `${gatewayBase}/${cid}`;
}

function createStorageClient() {
  return new Web3Storage({ token: requireToken() });
}

export async function uploadEncryptedPayload(payload) {
  const encrypted = await encryptJsonWithAesGcm(payload);

  const envelope = {
    version: 'cerebrum-envelope-v1',
    algorithm: encrypted.algorithm,
    iv: encrypted.iv,
    ciphertext: encrypted.ciphertext,
    createdAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(envelope)], {
    type: 'application/json',
  });

  const client = createStorageClient();
  const cid = await client.put([new File([blob], 'cerebrum-record.json')], {
    wrapWithDirectory: false,
  });

  const symmetricKeyBase64 = base64Utils.toBase64(encrypted.rawKey);
  upsertMetadataRecord({
    recordCid: cid,
    envelope,
    algorithm: encrypted.algorithm,
    revoked: false,
  });
  appendAuditEvent(cid, { action: 'upload', bytes: blob.size });

  return {
    mode: 'storacha',
    cid,
    bytes: blob.size,
    envelope,
    symmetricKeyBase64,
  };
}

export async function fetchEncryptedEnvelope(recordCid) {
  const response = await fetch(getGatewayUrl(recordCid));
  if (!response.ok) {
    throw new Error(`Failed to fetch envelope for CID ${recordCid}: ${response.status}`);
  }

  return response.json();
}
