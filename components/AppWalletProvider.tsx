'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// ↓ エラーが出るこの行を削除またはコメントアウト
// import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'; 
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';


export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY";

  // 最新版では空の配列でOKです。
  // Phantomなどの主要ウォレットは、自動的にWallet Standard経由で検出されます。
  const wallets = useMemo(() => [], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}