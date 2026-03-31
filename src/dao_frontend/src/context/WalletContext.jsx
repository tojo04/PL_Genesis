import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as fcl from '@onflow/fcl';

const WalletContext = createContext(undefined);

let configured = false;

function configureFcl() {
  if (configured) {
    return;
  }

  const accessNode = import.meta.env.VITE_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org';
  const discoveryWallet =
    import.meta.env.VITE_FLOW_DISCOVERY_WALLET ||
    'https://fcl-discovery.onflow.org/testnet/authn';
  const network = import.meta.env.VITE_FLOW_NETWORK || 'testnet';

  fcl
    .config()
    .put('app.detail.title', 'NeuraVault')
    .put('app.detail.icon', 'https://placehold.co/128x128/png')
    .put('flow.network', network)
    .put('accessNode.api', accessNode)
    .put('discovery.wallet', discoveryWallet)
    .put('walletconnect.projectId', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '');

  configured = true;
}

export function WalletProvider({ children }) {
  const [user, setUser] = useState({ loggedIn: false });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    configureFcl();
    const unsubscribe = fcl.currentUser.subscribe((nextUser) => {
      setUser(nextUser || { loggedIn: false });
      setIsConnecting(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      await fcl.authenticate();
    } catch (error) {
      console.error('Flow auth failed', error);
      setIsConnecting(false);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    await fcl.unauthenticate();
  };

  const value = useMemo(
    () => ({
      user,
      address: user?.addr || null,
      isAuthenticated: Boolean(user?.loggedIn),
      isConnecting,
      connectWallet,
      disconnectWallet,
    }),
    [user, isConnecting]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used inside WalletProvider');
  }
  return context;
}
