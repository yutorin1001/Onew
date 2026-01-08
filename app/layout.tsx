import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// ここに移動させる
import "@solana/wallet-adapter-react-ui/styles.css"; 
import AppWalletProvider from "../components/AppWalletProvider";





export const metadata: Metadata = {
  title: "My Custom DEX",
  description: "Powered by Jupiter & Helius",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}