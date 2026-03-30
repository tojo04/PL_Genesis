import React from 'react';

const rows = [
  {
    time: '2026-03-30T15:06:00Z',
    actor: '0xResearchWallet',
    cid: 'bafybeig7...x9n',
    action: 'decrypt-approved',
    purpose: 'sleep-study',
  },
  {
    time: '2026-03-30T15:11:00Z',
    actor: '0xResearchWallet',
    cid: 'bafybeig7...x9n',
    action: 'revoke',
    purpose: 'sleep-study',
  },
  {
    time: '2026-03-30T15:18:00Z',
    actor: '0xAppWallet',
    cid: 'bafybeif3...k2q',
    action: 'decrypt-denied',
    purpose: 'model-training',
  },
];

export default function AccessLogPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-24 sm:px-6">
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">Access and Revocation Log</h1>
        <p className="mt-2 text-slate-300">
          Immutable-style event feed for consent grants, decrypt attempts, and revocations.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">CID</th>
                <th className="px-3 py-2">Purpose</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.time}-${row.action}`} className="border-b border-slate-900 text-slate-200">
                  <td className="px-3 py-2">{new Date(row.time).toLocaleString()}</td>
                  <td className="px-3 py-2">{row.actor}</td>
                  <td className="px-3 py-2">{row.cid}</td>
                  <td className="px-3 py-2">{row.purpose}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                      {row.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
