// src/lib/networkConfig.ts

import { baseSepolia, sepolia, arbitrumSepolia } from "wagmi/chains";
// Zaimportuj konfigurację adresów kontraktów, którą już masz
import { gmCoreConfig } from "./contracts";

// Definiujemy, jakich danych potrzebuje każdy kafelek
export interface NetworkConfig {
  name: string;
  chain: {
    // POPRAWKA: ID może być tylko jednym z tych dwóch
    id: (typeof baseSepolia.id) | (typeof sepolia.id) | (typeof arbitrumSepolia.id); 
    name: string;
  };
  logoUrl: string;
  contractAddress: `0x${string}`;
}
// Stwórz folder /public/logos/ i wrzuć tam pliki PNG
// (np. /public/logos/base.png, /public/logos/ethereum.png)

// GŁÓWNA LISTA KONFIGURACYJNA
export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    name: "Base Sepolia",
    chain: {
      id: baseSepolia.id,
      name: "Base Sepolia",
    },
    logoUrl: "/logos/base.png",
    contractAddress: gmCoreConfig.address[baseSepolia.id],
  },
  {
    name: "Ethereum Sepolia",
    chain: {
      id: sepolia.id,
      name: "Sepolia",
    },
    logoUrl: "/logos/ethereum.png",
    contractAddress: gmCoreConfig.address[sepolia.id],
  },
  {
    name: "Arbitrum Sepolia",
    chain: {
      id: arbitrumSepolia.id,
      name: "Arbitrum Sepolia",
    },
    logoUrl: "/logos/arbitrum.png",
    contractAddress: gmCoreConfig.address[arbitrumSepolia.id],
  },
  // PRZYKŁAD: Jak dodasz nową sieć (np. Polygon) w przyszłości:
  // {
  //   name: "Polygon Mumbai",
  //   chain: {
  //     id: polygonMumbai.id,
  //     name: "Mumbai",
  //   },
  //   logoUrl: "/logos/polygon.png",
  //   contractAddress: gmContractConfig.address[polygonMumbai.id],
  // },
];