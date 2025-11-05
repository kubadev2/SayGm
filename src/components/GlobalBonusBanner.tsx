// src/components/GlobalBonusBanner.tsx
"use client";

import { useState, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import { gmCoreConfig } from "../lib/contracts";

function formatCountdown(seconds: number) {
  const d = String(Math.floor(seconds / (3600 * 24)));
  const h = String(Math.floor((seconds % (3600 * 24)) / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(seconds % 60)).padStart(2, "0");
  
  if (Number(d) > 0) {
    return `${d}d ${h}:${m}:${s}`;
  }
  return `${h}:${m}:${s}`;
}

export function GlobalBonusBanner() {
  const [countdown, setCountdown] = useState("");
  const [isActive, setIsActive] = useState(false);

  const { chain } = useAccount();
  
  const contractAddress = chain 
    ? gmCoreConfig.address[chain.id as keyof typeof gmCoreConfig.address] 
    : undefined;

  const { data: globalBonusEndTime, status, error } = useReadContract({
    address: contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "globalBonusEndTime",
    query: {
      enabled: !!contractAddress, 
    }
  });

  useEffect(() => {
    if (status === 'pending') {
      return;
    }

    if (status === 'error' || error) {
      return;
    }

    if (!globalBonusEndTime || globalBonusEndTime < BigInt(1700000000)) {
      return; 
    }

    const endTime = Number(globalBonusEndTime);

    const updateCountdown = () => {
      const now = Math.floor(new Date().getTime() / 1000);
      const remainingSeconds = endTime - now;

      if (remainingSeconds <= 0) {
        setIsActive(false);
        setCountdown("");
        return false; 
      } else {
        setIsActive(true);
        setCountdown(formatCountdown(remainingSeconds));
        return true; 
      }
    };

    if (!updateCountdown()) return; 
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [globalBonusEndTime, status, error]); 

  if (isActive) {
    return (
      <div className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-3 text-center text-white font-semibold shadow-lg rounded-lg">
        🔥 Global x1000 Points Bonus is ACTIVE! Ends in: {countdown}
      </div>
    );
  }

  return null;
}