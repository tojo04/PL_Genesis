import React, { useState } from 'react';
import { grantAccessPolicy, revokeAccessPolicy } from '../services/litAccess';

export default function ConsentPage() {
  const [wallet, setWallet] = useState('0xResearchWallet');
  const [purpose, setPurpose] = useState('sleep-study');
  const [durationHours, setDurationHours] = useState(72);
  const [recordCid, setRecordCid] = useState('bafybeig7...x9n');
  const [result, setResult] = useState(null);

  const onGrant = async () => {
    const response = await grantAccessPolicy({ wallet, purpose, durationHours, recordCid });
    setResult(response);
  };

  const onRevoke = async () => {
    const response = await revokeAccessPolicy({ wallet, recordCid });
    setResult(response);
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-20 pt-24 sm:px-6">
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">Consent Control Center</h1>
        <p className="mt-2 text-slate-300">
          Configure who can decrypt which record, why they can access it, and for how long.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="text-sm text-slate-200">
            Researcher Wallet
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <label className="text-sm text-slate-200">
            Purpose
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
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
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onGrant}
            className="rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-2 font-semibold text-black"
          >
            Grant Consent
          </button>
          <button
            onClick={onRevoke}
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 font-semibold text-rose-100"
          >
            Revoke Access
          </button>
        </div>

        {result && (
          <pre className="mt-4 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
