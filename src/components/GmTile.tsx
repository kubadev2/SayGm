"use client";

import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import { NetworkConfig } from "../lib/networkConfig";
import { gmCoreConfig } from "../lib/contracts"; 
import { useEffect, useState } from "react";
import { ChainBonusTimer } from "./ChainBonusTimer"; 

interface GmTileProps {
  config: NetworkConfig;
}

function formatCountdown(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

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

export function GmTile({ config }: GmTileProps) {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const { data: hash, writeContract, reset: resetWriteContract, isPending: isTxPending } = useWriteContract();
  
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({ hash });

  const isCurrentChain = chain?.id === config.chain.id;

  const {
    data: lastGmTime,
    refetch: refetchLastGmTime,
    status: lastGmTimeStatus,
  } = useReadContract({
    address: config.contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "lastGmTime",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && isCurrentChain,
    },
  });

  const {
    data: gmFee,
    status: gmFeeStatus,
    isLoading: isFeeLoading,
  } = useReadContract({
    address: config.contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "calculateFee",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && isCurrentChain,
    },
  });

  const { 
    data: userGmCount, 
    refetch: refetchGmCount,
    status: gmCountStatus,
  } = useReadContract({
    address: config.contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "gmCount",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && isCurrentChain,
    },
  });
  
  const { 
    data: userTotalPoints, 
    refetch: refetchPoints,
    status: pointsStatus,
  } = useReadContract({
    address: config.contractAddress,
    abi: gmCoreConfig.abi,
    functionName: "points",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && isCurrentChain,
    },
  });

  const isLoadingStats = isFeeLoading || gmCountStatus === 'pending' || pointsStatus === 'pending';

  const [countdown, setCountdown] = useState("");
  const [isCooldown, setIsCooldown] = useState(false);
  const startCountdown = (endTime: number) => {
    const interval = setInterval(() => {
      const now = Math.floor(new Date().getTime() / 1000);
      const remainingSeconds = endTime - now;
      if (remainingSeconds <= 0) {
        setCountdown("");
        setIsCooldown(false);
        clearInterval(interval);
      } else {
        setCountdown(formatCountdown(remainingSeconds));
        setIsCooldown(true);
      }
    }, 1000);
    return interval;
  };

  useEffect(() => {
    if (isTxSuccess) {
      refetchLastGmTime();
      refetchGmCount();
      refetchPoints();

      const COOLDOWN_SECONDS = 24 * 60 * 60;
      const now = Math.floor(new Date().getTime() / 1000);
      const cooldownEndTime = now + COOLDOWN_SECONDS;
      
      const remaining = cooldownEndTime - now;
      setCountdown(formatCountdown(remaining)); 
      setIsCooldown(true);
      
    }
  }, [isTxSuccess, refetchLastGmTime, refetchGmCount, refetchPoints]);

  useEffect(() => {
    if (lastGmTimeStatus === 'pending') return;
    if (!lastGmTime || lastGmTime === BigInt(0)) {
      setCountdown("");
      setIsCooldown(false);
      return;
    }
    
    const COOLDOWN_SECONDS = 24 * 60 * 60;
    const cooldownEndTime = Number(lastGmTime) + COOLDOWN_SECONDS;
    
    const now = Math.floor(new Date().getTime() / 1000);
    if (cooldownEndTime <= now) {
      setCountdown("");
      setIsCooldown(false);
      return;
    }

    const interval = startCountdown(cooldownEndTime);
    return () => clearInterval(interval);

  }, [lastGmTime, lastGmTimeStatus]);

  useEffect(() => {
    if (!isCurrentChain) {
      setCountdown("");
      setIsCooldown(false);
      resetWriteContract(); 
    }
  }, [isCurrentChain, resetWriteContract]);

  const handleGmClick = () => {
    if (!isCurrentChain) {
      switchChain?.({ chainId: config.chain.id });
      return;
    }
    if (gmFee === undefined) return;
    writeContract({
      address: config.contractAddress,
      abi: gmCoreConfig.abi,
      functionName: "sayGm",
      value: gmFee,
    });
  };

  const hasCheckedStatus = lastGmTimeStatus === 'success';
  const hasCheckedFee = gmFeeStatus === 'success';
  const hasCheckedPoints = pointsStatus === 'success' && gmCountStatus === 'success';
  let buttonContent: React.ReactNode = "Connect Wallet";
  let buttonDisabled = !isConnected;
  
  if (isConnected) {
    if (!isCurrentChain) {
      buttonContent = `Switch to ${config.chain.name}`;
      buttonDisabled = false;
    } else if (isTxPending || isTxLoading) { 
      buttonContent = <SpinnerIcon />;
      buttonDisabled = true;
    } else if (isCooldown) { 
      buttonContent = `Next GM in ${countdown}`;
      buttonDisabled = true;
    } else if (hasCheckedStatus && hasCheckedFee && hasCheckedPoints) { 
      buttonContent = "Say GM";
      buttonDisabled = false;
    } else { 
      buttonContent = "Checking status...";
      buttonDisabled = true;
    }
  }

  return (
    <div
      className={`
        bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between
        ring-1 ring-white/10
        transition-all duration-300 ease-in-out
        hover:scale-[1.03] hover:shadow-2xl
        ${
          isCurrentChain && !isCooldown
            ? "ring-2 ring-blue-500 shadow-blue-500/10"
            : isCooldown && isCurrentChain
            ? "ring-1 ring-gray-600"
            : "hover:ring-white/20"
        }
        ${isCooldown && isCurrentChain ? "opacity-70" : ""}
      `}
    >
      <div>
        <div className="flex items-center mb-5">
          <img
            src={config.logoUrl}
            alt={`${config.name} logo`}
            className="w-10 h-10 rounded-full mr-4"
          />
          <span className="text-xl font-bold text-white tracking-wide">
            {config.name}
          </span>
        </div>

        <div className="mb-4">
          <ChainBonusTimer config={config} isCurrentChain={isCurrentChain} />
        </div>

        <div className="text-sm text-gray-400 mb-5 space-y-2">
          
          <p className="flex items-center justify-between h-5">
            <span className="opacity-70">Fee:</span>
            {!isConnected ? (
              <span className="italic text-gray-500">Connect wallet</span>
            ) : !isCurrentChain ? (
              <span className="italic text-gray-400">Switch chain to see fee</span>
            ) : isFeeLoading ? ( 
              <div className="animate-pulse bg-gray-600 rounded-md h-5 w-24"></div>
            ) : (
              <span className="font-semibold text-white">
                {formatEther(gmFee ?? BigInt(0))} ETH
              </span>
            )}
          </p>
          
          <p className="flex items-center justify-between h-5">
            <span className="opacity-70">Your GMs:</span>
            {!isConnected || !isCurrentChain ? (
              <span className="italic text-gray-500">-</span>
            ) : isLoadingStats ? ( 
              <div className="animate-pulse bg-gray-600 rounded-md h-5 w-12"></div>
            ) : (
              <span className="font-semibold text-white">
                {userGmCount?.toString() ?? "0"}
              </span>
            )}
          </p>

          <p className="flex items-center justify-between h-5">
            <span className="opacity-70">Your Points:</span>
            {!isConnected || !isCurrentChain ? (
              <span className="italic text-gray-500">-</span>
            ) : isLoadingStats ? ( 
              <div className="animate-pulse bg-gray-600 rounded-md h-5 w-16"></div>
            ) : (
              <span className="font-semibold text-white">
                {userTotalPoints?.toString() ?? "0"}
              </span>
            )}
          </p>
        </div>
      </div>

      <button
        onClick={handleGmClick}
        disabled={buttonDisabled}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white
          transition-all duration-300 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isCurrentChain && isCooldown 
              ? "bg-gray-700 cursor-wait" 
            : isCurrentChain
              ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-600 hover:bg-gray-500" 
          }
        `}
      >
        {buttonContent}
      </button>

      <div className="h-5 mt-3 text-center text-sm">
        {isCurrentChain && isTxPending && (
          <p className="text-yellow-400">Check your wallet...</p>
        )}
        {isCurrentChain && isTxLoading && (
          <p className="text-yellow-400 animate-pulse">Processing...</p>
        )}
        {isCurrentChain && isTxSuccess && <p className="text-green-400">Confirmed!</p>}
      </div>
    </div>
  );
}