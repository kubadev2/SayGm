// src/components/MyReferralCode.tsx

"use client";

import { useAccount } from "wagmi";
import { useState } from "react";

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

export function MyReferralCode() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 ring-1 ring-white/10">
      <h3 className="text-xl font-bold text-white mb-2">Your Referral Code</h3>
      <p className="text-gray-400 text-sm mb-4">
        Share this address with your friends. When they register using your address, you will earn commissions on all their GMs.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={address}
          className="w-full flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white font-mono text-sm focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
          title="Copy Referral Code"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}