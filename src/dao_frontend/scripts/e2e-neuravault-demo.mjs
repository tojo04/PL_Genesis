import { uploadEncryptedPayload, fetchEncryptedEnvelope } from '../src/services/storachaClient.js';
import {
  decryptWithPolicy,
  grantAccessPolicy,
  revokeAccessPolicy,
} from '../src/services/litAccess.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function loadDotEnv() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(currentDir, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function validateEnv() {
  const required = ['VITE_STORACHA_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment values: ${missing.join(', ')}. Set them in src/dao_frontend/.env`
    );
  }
}

function buildSimulatedEEG() {
  const now = Date.now();
  const samples = Array.from({ length: 30 }, (_, idx) => ({
    t: now + idx * 200,
    alpha: Number((Math.random() * 20 + 20).toFixed(2)),
    beta: Number((Math.random() * 10 + 10).toFixed(2)),
    gamma: Number((Math.random() * 5 + 5).toFixed(2)),
  }));

  return {
    schema: 'sim.eeg.v1',
    subject: 'demo-script-subject',
    createdAt: new Date().toISOString(),
    samples,
  };
}

async function run() {
  loadDotEnv();
  validateEnv();

  const granteeWallet = process.env.DEMO_GRANTEE_WALLET || '0xResearchWallet';
  const purpose = process.env.DEMO_PURPOSE || 'sleep-study';
  const durationHours = Number(process.env.DEMO_DURATION_HOURS || '24');

  console.log('1) Connect wallet identity (simulated):', granteeWallet);

  const payload = buildSimulatedEEG();

  console.log('2) Encrypt + upload EEG to Storacha/Filecoin');
  const upload = await uploadEncryptedPayload(payload);
  console.log('   CID:', upload.cid);

  console.log('3) Grant Lit permission with key wrapping');
  const grant = await grantAccessPolicy({
    wallet: granteeWallet,
    purpose,
    durationHours,
    recordCid: upload.cid,
    symmetricKeyBase64: upload.symmetricKeyBase64,
  });
  console.log('   Policy ID:', grant.policy.id);

  console.log('4) Decrypt allowed');
  const envelope = await fetchEncryptedEnvelope(upload.cid);
  const allowed = await decryptWithPolicy({
    recordCid: upload.cid,
    envelope,
  });
  console.log('   Decrypt approved, sample count:', allowed.samples.length);

  console.log('5) Revoke consent');
  await revokeAccessPolicy({
    wallet: granteeWallet,
    recordCid: upload.cid,
  });

  console.log('6) Decrypt denied after revoke');
  try {
    await decryptWithPolicy({
      recordCid: upload.cid,
      envelope,
    });
    throw new Error('Expected decrypt failure after revoke, but it succeeded');
  } catch (error) {
    console.log('   Expected denial:', error.message);
  }

  console.log('\nEnd-to-end NeuraVault demo complete.');
}

run().catch((error) => {
  console.error('E2E demo failed:', error);
  process.exit(1);
});
