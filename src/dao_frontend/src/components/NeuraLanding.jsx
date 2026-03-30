import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, FileLock2, ShieldCheck, TimerReset } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const features = [
  {
    icon: FileLock2,
    title: 'Client-Side Encryption',
    description: 'Neural and biometric payloads are encrypted before they leave the browser.',
  },
  {
    icon: ShieldCheck,
    title: 'Granular Consent',
    description: 'Share by wallet identity, declared purpose, and expiration window.',
  },
  {
    icon: TimerReset,
    title: 'Instant Revocation',
    description: 'Revoke access at any moment and enforce decryption denial going forward.',
  },
];

export default function NeuraLanding() {
  const { isAuthenticated } = useWallet();

  return (
    <main className="relative min-h-screen px-4 pb-20 pt-24 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-10 rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-2xl shadow-teal-900/20 md:grid-cols-2 md:p-12">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs uppercase tracking-widest text-teal-200">
              Neurotech Track
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-100 md:text-5xl">
              Own, share, and revoke neural data with programmable consent
            </h1>
            <p className="mt-5 max-w-xl text-slate-300">
              NeuraVault stores encrypted EEG-style telemetry on decentralized storage while Lit Protocol
              enforces who can decrypt, for what purpose, and until when.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? '/upload' : '/vault'}
                className="rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-5 py-3 font-semibold text-black transition hover:brightness-110"
              >
                {isAuthenticated ? 'Upload Telemetry' : 'Open Vault'}
              </Link>
              <Link
                to="/consent"
                className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-teal-500/40 hover:text-teal-200"
              >
                Manage Consent
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Stack</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-teal-300" />
                Flow Wallet + FCL for identity and signatures
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-300" />
                Lit Protocol for permissioned decryption
              </li>
              <li className="flex items-center gap-2">
                <FileLock2 className="h-4 w-4 text-teal-300" />
                Storacha/Filecoin for encrypted blob storage
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-xl border border-slate-800 bg-black/40 p-6">
              <Icon className="mb-3 h-6 w-6 text-teal-300" />
              <h3 className="text-lg font-semibold text-slate-100">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
