import { uploadEncryptedPayload, fetchEncryptedEnvelope } from '../src/services/storachaClient.js';
import {
  decryptWithPolicy,
  grantAccessPolicy,
  revokeAccessPolicy,
} from '../src/services/litAccess.js';

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
