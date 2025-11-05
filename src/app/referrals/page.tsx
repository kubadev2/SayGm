// src/app/referrals/page.tsx

"use client"; 

import { useAccount } from "wagmi";
import { MyReferrerPanel } from "@/components/MyReferrerPanel";
import { MyReferralsList } from "@/components/MyReferralsList";
import { MyReferralCode } from "@/components/MyReferralCode";

function AccountInfo() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg ring-1 ring-white/10">
        <p className="text-gray-400">Connect your wallet to see your account.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg ring-1 ring-white/10">
      <p className="text-sm text-gray-400 mb-1">Your Connected Wallet</p>
      <p className="text-lg font-mono text-white break-all">{address}</p>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-white">
        Referral Dashboard
      </h2>

      <AccountInfo />
      <MyReferralCode />
      <MyReferrerPanel />
      <MyReferralsList />
    </div>
  );
}