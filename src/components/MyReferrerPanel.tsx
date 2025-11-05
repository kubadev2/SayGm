// src/components/MyReferrerPanel.tsx

"use client";

import { useAccount, useReadContracts, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { gmCoreConfig } from "../lib/contracts";
import { SUPPORTED_NETWORKS } from "../lib/networkConfig";
import { useState, useEffect } from "react";
import { isAddress } from "viem";

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.438-3.415-8.162-7.786-8.5C7.344 2.52 4.11 5.44 4.11 9.375v5.25c0 .621.504 1.125 1.125 1.125h3.375" />
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

function NetworkReferrerRow({ network, referrerAddress, isLoading, refetchReferrers }: { network: any, referrerAddress: string | null, isLoading: boolean, refetchReferrers: () => void }) {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [input, setInput] = useState("");
  const { data: hash, writeContract: register, reset } = useWriteContract();
  const { isLoading: isRegistering, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const [copied, setCopied] = useState(false);
  const isCurrentChain = chain?.id === network.chain.id;
  const isRegistered = referrerAddress && referrerAddress !== "0x0000000000000000000000000000000000000000";
  const [isPendingRegister, setIsPendingRegister] = useState(false);

  const handleButtonClick = () => {
    if (!isCurrentChain) {
      switchChain?.({ chainId: network.chain.id });
    } else {
      if (!isAddress(input)) {
        alert("Invalid address");
        return;
      }
      register({
        address: network.contractAddress,
        abi: gmCoreConfig.abi,
        functionName: "register",
        args: [input as `0x${string}`],
      });
    }
  };

  const handleCopy = () => {
    if (!referrerAddress) return;
    navigator.clipboard.writeText(referrerAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isSuccess) {
      refetchReferrers();
      reset();
    }
  }, [isSuccess, refetchReferrers, reset]);
  
  let buttonText = "Switch Network";
  let buttonDisabled = false;
  let buttonStyle = "bg-gray-600 hover:bg-gray-500"; 

  if (isCurrentChain) {
    buttonText = "Register";
    buttonDisabled = !isAddress(input) || isRegistering;
    buttonStyle = "bg-blue-600 hover:bg-blue-700 disabled:opacity-50";
    if (isRegistering) {
      buttonText = "Registering..."; 
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <img src={network.logoUrl} alt={network.name} className="w-6 h-6 rounded-full" />
        <span className="text-white">{network.name}</span>
      </div>
      
      <div className="flex items-center gap-2" style={{ minWidth: '300px' }}>
        {isLoading ? (
          <div className="animate-pulse bg-gray-600 rounded-md h-5 w-48"></div>
        ) : isRegistered ? (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-400 truncate" title={referrerAddress!}>
              Referred by: {referrerAddress?.slice(0, 6)}...{referrerAddress?.slice(-4)}
            </p>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-600"
              title="Copy address"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Paste referrer code"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-48 p-1 text-sm rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleButtonClick}
              disabled={buttonDisabled}
              className={`py-1 px-3 text-sm rounded-lg font-semibold text-white ${buttonStyle}`}
            >
              {isCurrentChain && isRegistering ? <SpinnerIcon /> : buttonText}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function MyReferrerPanel() {
  const { address, isConnected } = useAccount();

  const referrerCheckContracts = SUPPORTED_NETWORKS.map(network => ({
    address: gmCoreConfig.address[network.chain.id],
    abi: gmCoreConfig.abi,
    functionName: "referrerOf",
    args: [address as `0x${string}`],
    chainId: network.chain.id,
  }));

  const { data: results, isLoading: isLoadingReferrers, refetch: refetchReferrers } = useReadContracts({
    contracts: referrerCheckContracts,
    query: {
      enabled: isConnected && !!address,
    },
  });

  if (!isConnected) return null;

  return (
    <div className="bg-gray-800 rounded-2xl p-6 ring-1 ring-white/10">
      <h3 className="text-xl font-bold text-white mb-4">Your Referrer Status</h3>
      <div className="space-y-3">
        {SUPPORTED_NETWORKS.map((network, index) => {
          const referrerData = results?.[index];
          return (
            <NetworkReferrerRow 
              key={network.chain.id} 
              network={network} 
              referrerAddress={referrerData?.status === 'success' ? referrerData.result as string : null}
              isLoading={isLoadingReferrers}
              refetchReferrers={refetchReferrers}
            />
          );
        })}
      </div>
    </div>
  );
}