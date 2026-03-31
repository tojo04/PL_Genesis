import React from 'react';
import { Lock, Shield, Wallet, Zap } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function FlowConnectGate() {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 pb-16 pt-24 sm:px-6">
      <section className="w-full max-w-2xl rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-[#0f233a]/90 to-[#171f4b]/85 p-6 shadow-[0_0_40px_rgba(34,211,238,0.14)] backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_24px_rgba(96,165,250,0.45)]">
          <Shield className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-center text-4xl font-extrabold tracking-wide text-cyan-300 sm:text-5xl">
          FLOW IDENTITY
        </h1>
        <p className="mt-3 text-center text-lg text-cyan-200/90">
          Secure wallet authentication for protected DAO access
        </p>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/45 px-4 py-3 text-base text-slate-100">
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-300" />
              End-to-end encryption
            </span>
          </div>
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900/45 px-4 py-3 text-base text-slate-100">
            <span className="inline-flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-300" />
              Fast transaction verification
            </span>
          </div>
          <div className="rounded-xl border border-fuchsia-500/30 bg-slate-900/45 px-4 py-3 text-base text-slate-100">
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-fuchsia-300" />
              No seed phrases exposed to this app
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-cyan-100">
          <p className="inline-flex items-start gap-2 text-base">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            Connect with Flow Identity to access your DAO dashboard and governance tools.
          </p>
        </div>

        <button
          type="button"
          onClick={connectWallet}
          disabled={isConnecting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-4 text-lg font-bold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Shield className="h-5 w-5" />
          {isConnecting ? 'Connecting Identity...' : 'Connect Identity'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-300">
          By connecting, you agree to the DAO terms and privacy policy.
        </p>
      </section>
    </main>
  );
}