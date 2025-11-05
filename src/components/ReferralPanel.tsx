// src/components/ReferralPanel.tsx

"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, isAddress } from "viem";
import { useState, useEffect } from "react"; 
import { gmCoreConfig } from "../lib/contracts";

const SpinnerIcon = () => (
  <svg
    className="animate-spin h-5 w-5 text-white mx-auto"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export function ReferralPanel() {
  const { address, isConnected, chain } = useAccount();
  const [referrerInput, setReferrerInput] = useState("");

  const contractAddress = chain ? gmCoreConfig.address[chain.id as keyof typeof gmCoreConfig.address] : undefined;

  const { data: regHash, writeContract: register } = useWriteContract();
  const { data: claimHash, writeContract: claim } = useWriteContract();

  const { isLoading: isRegistering, isSuccess: isRegisterSuccess } = useWaitForTransactionReceipt({ hash: regHash });
  const { isLoading: isClaiming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  const { data: userReferrer, refetch: refetchReferrer } = useReadContract({
    address: contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "referrerOf",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && !!contractAddress,
    },
  });

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "pendingRewards",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && !!contractAddress,
    },
  });

  const isRegistered = userReferrer && userReferrer !== "0x0000000000000000000000000000000000000000";
  const hasPendingRewards = pendingRewards && pendingRewards > BigInt(0);

  const handleRegister = () => {
    if (!contractAddress || !isAddress(referrerInput)) {
      alert("Invalid referrer address");
      return;
    }
    register({
      address: contractAddress,
      abi: gmCoreConfig.abi,
      functionName: "register",
      args: [referrerInput as `0x${string}`],
    });
  };

  const handleClaim = () => {
    if (!contractAddress) return;
    claim({
      address: contractAddress,
      abi: gmCoreConfig.abi,
      functionName: "claimRewards",
    });
  };

  useEffect(() => {
    if (isRegisterSuccess) { 
      refetchReferrer();
    }
  }, [isRegisterSuccess, refetchReferrer]);

  useEffect(() => {
    if (isClaimSuccess) { 
      refetchRewards();
    }
  }, [isClaimSuccess, refetchRewards]);


  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 text-center text-gray-400">
        Connect your wallet to see referral info.
      </div>
    );
  }

  if (!contractAddress) {
     return (
      <div className="bg-gray-800 rounded-2xl p-6 text-center text-gray-400">
        Referral system is not available on this network.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 ring-1 ring-white/10">
      <h3 className="text-xl font-bold text-white mb-4">Referral System</h3>
      
      {!isRegistered && (
        <div className="space-y-3">
          <p className="text-gray-300">
            Join with a referral code to get a discount on GM fees!
          </p>
          <input
            type="text"
            value={referrerInput}
            onChange={(e) => setReferrerInput(e.target.value)}
            placeholder="Paste referrer address (0x...)"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleRegister}
            disabled={!isAddress(referrerInput) || isRegistering}
            className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isRegistering ? <SpinnerIcon /> : "Register"}
          </button>
        </div>
      )}

      {isRegistered && (
         <div className="space-y-3">
          <p className="text-green-400">You are registered in the referral system!</p>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p className="text-gray-400 text-sm">Your available rewards</p>
            <p className="text-white text-2xl font-bold">
              {formatEther(pendingRewards ?? BigInt(0))} ETH
            </p>
          </div>
          <button
            onClick={handleClaim}
            disabled={!hasPendingRewards || isClaiming}
            className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isClaiming ? <SpinnerIcon /> : "Claim Rewards"}
          </button>
        </div>
      )}
    </div>
  );
}