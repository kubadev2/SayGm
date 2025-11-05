"use client";

import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { gmCoreConfig } from "../lib/contracts";
import { SUPPORTED_NETWORKS, SupportedChainId } from "../lib/networkConfig";
import { useState, useEffect } from "react";

export function MyReferralsList() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId>(chain?.id ?? SUPPORTED_NETWORKS[0].chain.id);

  const isChainSelected = chain?.id === selectedChainId;

  const contractAddress = gmCoreConfig.address[selectedChainId as keyof typeof gmCoreConfig.address];

  const { data: referredUsers, isLoading, refetch } = useReadContract({
    address: contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "getReferredUsers",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && !!contractAddress && isChainSelected,
    },
  });

  const userList = (Array.isArray(referredUsers) ? referredUsers : []) as readonly `0x${string}`[];

  useEffect(() => {
    if (isChainSelected) {
      refetch(); 
    }
  }, [isChainSelected, refetch]);

  useEffect(() => {
    if (chain?.id) {
      setSelectedChainId(chain.id as SupportedChainId);
    }
  }, [chain?.id]);

  const handleNetworkSelect = (chainId: number) => {
    const newChainId = chainId as SupportedChainId;
    setSelectedChainId(newChainId);
    if (chain?.id !== newChainId) {
      switchChain?.({ chainId: newChainId });
    }
  };

  if (!isConnected) return null;

  return (
    <div className="bg-gray-800 rounded-2xl p-6 ring-1 ring-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">
          Your L1 Referrals ({!isChainSelected ? '?' : isLoading ? '...' : userList.length})
        </h3>
        
        <select
          value={selectedChainId}
          onChange={(e) => handleNetworkSelect(Number(e.target.value))}
          className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {SUPPORTED_NETWORKS.map(network => (
            <option key={network.chain.id} value={network.chain.id}>
              {network.name}
            </option>
          ))}
        </select>
      </div>

      {!isChainSelected ? (
        <p className="text-gray-400">Switch network to view your referrals for this chain.</p>
      ) : isLoading ? (
        <p className="text-gray-400">Loading your referral list...</p>
      ) : (userList.length === 0) ? (
        <p className="text-gray-400">You haven't referred anyone on this network yet.</p>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {userList.map((user: `0x${string}`, index: number) => (
            <li 
              key={index} 
              className="font-mono text-sm text-gray-300 bg-gray-700 p-2 rounded truncate"
              title={user}
            >
              {user}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}