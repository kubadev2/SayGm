// src/lib/contracts.ts
import { sepolia, baseSepolia, arbitrumSepolia } from 'wagmi/chains';
import GmCoreAbi from './abi/GmCore.json'; // Zaimportuj nowe ABI

// Mamy już tylko JEDEN config
export const gmCoreConfig = {
  address: {
    [sepolia.id]: '0x62fEB768286ddC2E89CbedDA7d36A7c1e5614a6B' as `0x${string}`,
    [baseSepolia.id]: '0x2019A32b0ed6fc326f586D180265A6a9F518E86b' as `0x${string}`,
    [arbitrumSepolia.id]: '0xEE66AD084925c23B7d87530148E33825a0D0982C' as `0x${string}`,
  } as const, 
  abi: GmCoreAbi as const,
};