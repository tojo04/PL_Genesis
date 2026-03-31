import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Database, KeyRound, ShieldCheck, Wallet, Lock, BarChart3 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const navItems = [
  { name: 'Vault', href: '/vault', icon: Database },
  { name: 'Upload', href: '/upload', icon: Brain },
  { name: 'Consent', href: '/consent', icon: KeyRound },
  { name: 'Access', href: '/access', icon: Lock },
  { name: 'Metrics', href: '/metrics', icon: BarChart3 },
  { name: 'Access Log', href: '/access-log', icon: ShieldCheck },
];

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, address, connectWallet, disconnectWallet, isConnecting } = useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-teal-500/20 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 p-2">
            <Brain className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-300">Cerebrum</p>
            <p className="text-xs text-slate-400">Neural Data Wallet</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border border-teal-400/40 bg-teal-500/20 text-teal-200'
                    : 'border border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/70 hover:text-teal-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <span className="hidden rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-300 sm:block">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          )}

          {!isAuthenticated ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-3 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Wallet className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Flow'}
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-teal-500/40 hover:text-teal-200"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
