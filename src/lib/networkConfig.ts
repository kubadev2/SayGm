import { baseSepolia, sepolia, arbitrumSepolia } from "wagmi/chains";
import { gmCoreConfig } from "./contracts";

export type SupportedChainId = 
  | typeof baseSepolia.id 
  | typeof sepolia.id 
  | typeof arbitrumSepolia.id;

export interface NetworkConfig {
  name: string;
  chain: {
    id: SupportedChainId; 
    name: string;
  };
  logoUrl: string;
  contractAddress: `0x${string}`;
}

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
];