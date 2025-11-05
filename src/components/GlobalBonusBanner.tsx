// src/components/GlobalBonusBanner.tsx
"use client";

import { useState, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import { gmCoreConfig } from "../lib/contracts";

function formatCountdown(seconds: number) {
  const d = String(Math.floor(seconds / (3600 * 24)));
  const h = String(Math.floor((seconds % (3600 * 24)) / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  
  if (Number(d) > 0) {
    return `${d}d ${h}:${m}:${s}`;
  }
  return `${h}:${m}:${s}`;
}

export function GlobalBonusBanner() {
  const [countdown, setCountdown] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [debugMessage, setDebugMessage] = useState("Initializing..."); 

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
      setDebugMessage("Debug: Loading timestamp (status: pending)...");
      return;
    }

    if (status === 'error' || error) {
      setDebugMessage(`Debug: Read error! ${error?.message}`);
      return;
    }

    if (!globalBonusEndTime || globalBonusEndTime < BigInt(1700000000)) {
      setDebugMessage(`Debug: Timestamp invalid or not set: ${String(globalBonusEndTime)}`);
      return; 
    }

    const endTime = Number(globalBonusEndTime);

    const updateCountdown = () => {
      const now = Math.floor(new Date().getTime() / 1000);
      const remainingSeconds = endTime - now;

      if (remainingSeconds <= 0) {
        setIsActive(false);
        setCountdown("");
        setDebugMessage("Debug: Bonus time has expired.");
        return false; 
      } else {
        setIsActive(true);
        setCountdown(formatCountdown(remainingSeconds));
        setDebugMessage("");
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

  return (
    <div className="w-full bg-gray-700 p-3 text-center text-yellow-300 font-mono text-xs rounded-lg">
      {debugMessage}
    </div>
  );
}