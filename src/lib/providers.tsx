// src/lib/providers.tsx

"use client"; 

import React from "react";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importujemy TYLKO gotową konfigurację
import { getConfig } from "../wagmi";

// -----------------------------------------------------------------

// 1. Stwórz QueryClient
const queryClient = new QueryClient();

// 2. Pobierz gotową konfigurację z wagmi.ts
const wagmiConfig = getConfig(); 

// -----------------------------------------------------------------

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    // 3. Owiń wszystko
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        {/* Ten provider pobierze teraz wszystko z wagmiConfig */}
        <RainbowKitProvider> 
          {mounted && children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}