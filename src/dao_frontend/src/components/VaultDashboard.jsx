import React from 'react';
import { Link } from 'react-router-dom';
import { HardDriveUpload, KeyRound, ShieldCheck, Waves } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const records = [
  { id: 'NV-0142', type: 'EEG Session', cid: 'bafybeig7...x9n', status: 'Encrypted', createdAt: '2026-03-30' },
  { id: 'NV-0141', type: 'Heart + EEG Bundle', cid: 'bafybeif3...k2q', status: 'Shared', createdAt: '2026-03-28' },
  { id: 'NV-0137', type: 'Sleep Telemetry', cid: 'bafybeie9...w4h', status: 'Revoked', createdAt: '2026-03-21' },
];

export default function VaultDashboard() {
  const { address } = useWallet();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-24 sm:px-6">
      <section className="mb-6 rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-slate-100">Vault Dashboard</h1>
        <p className="mt-2 text-slate-300">
          Track encrypted records, active consents, and revocation controls from one place.
        </p>

        <div className="mt-4 rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-sm text-teal-100">
          Connected as {address}
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-black/40 p-5">
          <HardDriveUpload className="h-5 w-5 text-teal-300" />
          <p className="mt-2 text-sm text-slate-400">Encrypted Files</p>
          <p className="text-2xl font-semibold text-slate-100">38</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-black/40 p-5">
          <KeyRound className="h-5 w-5 text-teal-300" />
          <p className="mt-2 text-sm text-slate-400">Active Consents</p>
          <p className="text-2xl font-semibold text-slate-100">11</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-black/40 p-5">
          <ShieldCheck className="h-5 w-5 text-teal-300" />
          <p className="mt-2 text-sm text-slate-400">Revocations</p>
          <p className="text-2xl font-semibold text-slate-100">6</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Recent Records</h2>
          <Link to="/upload" className="text-sm font-semibold text-teal-300 hover:text-teal-200">
            Upload New
          </Link>
        </div>

        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border border-slate-800 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{record.type}</p>
                  <p className="text-xs text-slate-400">{record.id} • {record.createdAt}</p>
                </div>
                <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                  {record.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">CID: {record.cid}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400">
          <Waves className="h-4 w-4" />
          Data shown here is simulated for hackathon demo mode.
        </div>
      </section>
    </main>
  );
}
