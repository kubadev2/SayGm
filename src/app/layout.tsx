import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css"; 
import type { Metadata } from "next";
import { Providers } from "../lib/providers"; 
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const metadata: Metadata = {
  title: "gm-core",
  description: "Your on-chain GM protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="bg-gray-900 text-white min-h-screen">
        <Providers>
          <header className="flex justify-between items-center p-4 border-b border-gray-700">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold">
                gm-core
              </Link>
              <nav>
                <Link href="/referrals" className="text-gray-300 hover:text-white transition-colors">
                  Referrals
                </Link>
              </nav>
            </div>
            <ConnectButton />
          </header>
          <main className="p-8 max-w-7xl mx-auto w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}