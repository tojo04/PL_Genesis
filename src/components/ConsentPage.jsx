import React, { useState } from 'react';
import { grantAccessPolicy, revokeAccessPolicy, decryptWithPolicy } from '../services/litAccess';
import { fetchEncryptedEnvelope } from '../services/storachaClient';
import { getMetadataRecord } from '../services/metadataIndex';

export default function ConsentPage() {
  const [wallet, setWallet] = useState('0xResearchWallet');
  const [purpose, setPurpose] = useState('sleep-study');
  const [durationHours, setDurationHours] = useState(72);
  const [recordCid, setRecordCid] = useState('bafybeig7...x9n');
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decrypted, setDecrypted] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const onGrant = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await grantAccessPolicy({ wallet, purpose, durationHours, recordCid });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRevoke = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await revokeAccessPolicy({ wallet, recordCid });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDecrypt = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!metadata || !metadata.envelope) {
        setError('No envelope found. Did you grant consent first?');
        setLoading(false);
        return;
      }

      const decryptedPayload = await decryptWithPolicy({
        recordCid,
        envelope: metadata.envelope,
      });
      setDecrypted(decryptedPayload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onLoadMetadata = () => {
    setLoading(true);
    setError(null);
    try {
      const record = getMetadataRecord(recordCid);
      if (!record) {
        setError('No metadata found for this CID. Did you upload a record first?');
        setMetadata(null);
      } else {
        setMetadata(record);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-20 pt-24 sm:px-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-500/10 p-4 text-sm text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Grant & Revoke Section */}
        <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
          <h1 className="text-2xl font-semibold text-slate-100">Access Control</h1>
          <p className="mt-2 text-slate-300">
            Grant or revoke access to biomedical records using Lit Protocol policies.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="text-sm text-slate-200">
              Researcher Wallet
              <input
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                placeholder="0xResearchWallet"
              />
            </label>

            <label className="text-sm text-slate-200">
              Purpose
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                placeholder="e.g., sleep-study"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-200">
                Duration (Hours)
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value || 1))}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
              </label>

              <label className="text-sm text-slate-200">
                Record CID
                <input
                  value={recordCid}
                  onChange={(e) => setRecordCid(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  placeholder="bafy..."
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onGrant}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-2 font-semibold text-black disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Grant Consent'}
            </button>
            <button
              onClick={onRevoke}
              disabled={loading}
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 font-semibold text-rose-100 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Revoke Access'}
            </button>
          </div>

          {result && (
            <div className="mt-4 rounded-lg bg-green-500/10 p-4">
              <h3 className="text-sm font-semibold text-green-300">Response</h3>
              <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* Decrypt & Audit Section */}
        <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
          <h1 className="text-2xl font-semibold text-slate-100">Decrypt & Audit</h1>
          <p className="mt-2 text-slate-300">
            Fetch record metadata, decrypt with valid policy, and view audit trail.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onLoadMetadata}
              disabled={loading || !recordCid}
              className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 font-semibold text-blue-100 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Metadata'}
            </button>
            <button
              onClick={onDecrypt}
              disabled={loading || !metadata}
              className="rounded-lg bg-gradient-to-r from-purple-400 to-indigo-500 px-4 py-2 font-semibold text-black disabled:opacity-50"
            >
              {loading ? 'Decrypting...' : 'Decrypt Data'}
            </button>
          </div>

          {/* Metadata Display */}
          {metadata && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-slate-900/50 p-3">
                <h3 className="text-sm font-semibold text-slate-200">Policy Details</h3>
                <div className="mt-2 space-y-1 text-xs text-slate-300">
                  <p>
                    <strong>Grantee:</strong> {metadata.policy?.granteeWallet || 'N/A'}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {metadata.policy?.purpose || 'N/A'}
                  </p>
                  <p>
                    <strong>Expires:</strong>{' '}
                    {metadata.policy?.expiresAt
                      ? new Date(metadata.policy.expiresAt).toLocaleString()
                      : 'N/A'}
                  </p>
                  <p>
                    <strong>Revoked:</strong>{' '}
                    <span
                      className={
                        metadata.revoked
                          ? 'text-red-300'
                          : 'text-green-300'
                      }
                    >
                      {metadata.revoked ? 'Yes ❌' : 'No ✓'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Audit Trail */}
              {metadata.auditTrail && metadata.auditTrail.length > 0 && (
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <h3 className="text-sm font-semibold text-slate-200">Audit Trail</h3>
                  <div className="mt-2 max-h-48 space-y-1 overflow-auto">
                    {metadata.auditTrail.map((event, idx) => (
                      <div
                        key={idx}
                        className="border-l-2 border-slate-700 pl-2 text-xs text-slate-300"
                      >
                        <p className="font-mono">
                          [{new Date(event.timestamp).toLocaleTimeString()}]{' '}
                          <span className="text-blue-300">{event.action}</span>
                        </p>
                        {event.reason && (
                          <p className="text-slate-400">
                            Reason: {event.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Decrypted Data Display */}
          {decrypted && (
            <div className="mt-4 rounded-lg bg-green-500/10 p-4">
              <h3 className="text-sm font-semibold text-green-300">
                ✓ Decrypted Successfully
              </h3>
              <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">
                {JSON.stringify(decrypted, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
