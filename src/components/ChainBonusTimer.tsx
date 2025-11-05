// src/components/ChainBonusTimer.tsx
"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { gmCoreConfig } from "../lib/contracts";
import { NetworkConfig } from "../lib/networkConfig";

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

interface ChainBonusTimerProps {
  config: NetworkConfig;
  isCurrentChain: boolean;
}

export function ChainBonusTimer({ config, isCurrentChain }: ChainBonusTimerProps) {
  const [countdown, setCountdown] = useState("");
  const [isActive, setIsActive] = useState(false);

  const { data: chainLaunchBonusEndTime } = useReadContract({
    address: config.contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "chainLaunchBonusEndTime",
    query: {
      enabled: isCurrentChain, 
    },
  });

  useEffect(() => {
    if (!isCurrentChain || !chainLaunchBonusEndTime) {
      setIsActive(false);
      setCountdown("");
      return;
    }

    const endTime = Number(chainLaunchBonusEndTime);

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
  }, [chainLaunchBonusEndTime, isCurrentChain]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full text-center">
      ⚡ x10 Launch Bonus active for: {countdown}
    </div>
  );
}