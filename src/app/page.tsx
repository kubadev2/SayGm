import { SUPPORTED_NETWORKS } from "../lib/networkConfig"; 
import { GmTile } from "../components/GmTile";
import { ReferralPanel } from "../components/ReferralPanel";
import { GlobalBonusBanner } from "@/components/GlobalBonusBanner"; 

export default function Home() {
  return (
    <div className="space-y-8"> 
      <GlobalBonusBanner />

      <h2 className="text-3xl font-semibold text-white">
        Select a network to say "GM"
      </h2>

      <ReferralPanel />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUPPORTED_NETWORKS.map((networkConfig) => (
          <GmTile
            key={networkConfig.chain.id}
            config={networkConfig}
          />
        ))}
      </div>
    </div>
  );
}