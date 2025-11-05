// src/wagmi.ts

import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { baseSepolia, sepolia, arbitrumSepolia } from 'wagmi/chains'

// WAŻNE: Wracamy do Twoich ręcznych importów
import { injected, walletConnect } from 'wagmi/connectors'
// Usunąłem 'baseAccount' na razie, aby uprościć. 
// 'injected' obsłuży MetaMask, Brave, itp. w przeglądarce.

const chains = [baseSepolia, sepolia, arbitrumSepolia] as const;

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;
if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_WC_PROJECT_ID w .env.local");
}

// Tworzymy config z RĘCZNYMI konektorami
const config = createConfig({
  chains: chains,
  connectors: [
    injected(), // Dla portfeli w przeglądarce
    walletConnect({ projectId: projectId }), // Dla portfeli mobilnych (przez kod QR)
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

// Eksportujemy JEDNĄ funkcję, która zwraca gotowy config
export function getConfig() {
  return config;
}

// Twoja deklaracja TypeScript (zostaje bez zmian)
declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}