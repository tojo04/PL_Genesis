import React, { useMemo, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { listMetadataRecords } from '../services/metadataIndex';
import { fetchEncryptedEnvelope } from '../services/storachaClient';
import { decryptWithPolicy } from '../services/litAccess';

export default function AccessPage() {
  const { address, isAuthenticated, connectWallet, isConnecting } = useWallet();
  const records = useMemo(() => listMetadataRecords(), []);
  const [recordCid, setRecordCid] = useState(records[0]?.recordCid || '');
  const [status, setStatus] = useState(null);
  const [decrypted, setDecrypted] = useState(null);
  const [loading, setLoading] = useState(false);

  const tryDecrypt = async () => {
    setLoading(true);
    setStatus(null);
    setDecrypted(null);

    try {
      if (!recordCid.trim()) {
        throw new Error('Record CID is required');
      }

      const envelope = await fetchEncryptedEnvelope(recordCid.trim());
      const payload = await decryptWithPolicy({
        recordCid: recordCid.trim(),
        envelope,
      });

      setDecrypted(payload);
      setStatus({
        type: 'success',
        message: 'Access approved. Decryption succeeded for this wallet identity.',
      });
    } catch (error) {
      setStatus({
        type: 'denied',
        message: error instanceof Error ? error.message : 'Decryption denied',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-20 pt-24 sm:px-6">
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">Access Test</h1>
        <p className="mt-2 text-slate-300">
          Validate researcher access by attempting record decryption with the connected wallet.
        </p>

        {!isAuthenticated ? (
          <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            Connect a wallet to test decrypt access.
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="ml-3 rounded-md bg-amber-300 px-3 py-1 font-semibold text-black disabled:opacity-70"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-sm text-teal-100">
            Connected as {address}
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <label className="text-sm text-slate-200">
            Select Uploaded Record
            <select
              value={recordCid}
              onChange={(event) => setRecordCid(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Choose a record CID</option>
              {records.map((record) => (
                <option key={record.recordCid} value={record.recordCid}>
                  {record.recordCid}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Or Enter CID Manually
            <input
              value={recordCid}
              onChange={(event) => setRecordCid(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              placeholder="bafy..."
            />
          </label>
        </div>

        <div className="mt-6">
          <button
            onClick={tryDecrypt}
            disabled={loading || !isAuthenticated}
            className="rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-2 font-semibold text-black disabled:opacity-50"
          >
            {loading ? 'Testing Access...' : 'Try Decrypt'}
          </button>
        </div>

        {status && (
          <div
            className={`mt-4 rounded-lg p-4 text-sm ${
              status.type === 'success'
                ? 'border border-green-500/30 bg-green-500/10 text-green-200'
                : 'border border-rose-500/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            {status.message}
          </div>
        )}

        {decrypted && (
          <div className="mt-4 rounded-lg bg-green-500/10 p-4">
            <h3 className="text-sm font-semibold text-green-300">Decrypted Neural Data</h3>
            <pre className="mt-2 max-h-80 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">
              {JSON.stringify(decrypted, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </main>
  );
}