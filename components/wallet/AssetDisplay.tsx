import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, Bitcoin } from "lucide-react";
import { satoshisToBTC } from "@/utils";
import { Asset } from "@/types/rgb-types";
import { Link, useNavigate } from "react-router-dom";
import { useBTCBalance, useListAssets } from "@/hooks/useWalletQueries";
import { TxSkeleton } from "./TxSkeleton";



interface AssetDisplayProps {
  publicKey: string;
}
const upsertAsset = (list: Asset[], newAsset: Asset): Asset[] => {
  const index = list.findIndex(a => a.symbol === newAsset.symbol);
  if (index === -1) {
    return [...list, newAsset]; // Add
  }
  const updated = [...list];
  updated[index] = newAsset; // Replace
  return updated;
};
const upsertAssets = (prev: Asset[], incoming: Asset[]): Asset[] => {
  const map = new Map(prev.map(a => [a.symbol, a]));
  for (const asset of incoming) {
    map.set(asset.symbol, asset);
  }
  return Array.from(map.values());
};

export const AssetDisplay = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState("0.00");
  const [btcPrice] = useState(50200); // Mock BTC price for calculation
  
  // React Query hooks
  const { 
    data: btcBalanceData, 
    isLoading: btcLoading, 
    error: btcError 
  } = useBTCBalance();
  
  const { 
    data: assetsData, 
    isLoading: assetsLoading, 
    error: assetsError 
  } = useListAssets();


  useEffect(() => {
    if (!btcBalanceData) return;

    const { spendable } = btcBalanceData.vanilla;
    const btcAmount = satoshisToBTC(spendable);
    const btcValueUSD = parseFloat(btcAmount) * btcPrice;

    const newBTCAsset: Asset = {
      symbol: "BTC",
      asset_id: "bitcoin-asset-id", // mock
      name: "Bitcoin",
      balance: btcAmount,
      value: `$${btcValueUSD.toFixed(2)}`,
      change24h: 2.34, // mock
      icon: "₿",
    };

    setAssets(prev => upsertAsset(prev, newBTCAsset));
  }, [btcBalanceData, btcPrice]);

  useEffect(() => {
    if (!assetsData) return;

    const rgbAssets: Asset[] = [];

    const processAssets = (list?: Array<any> | null, defaultIcon = '🎨') => {
      if (!list) return;
  
      for (const asset of list) {
        const balance = asset.balance.spendable / Math.pow(10, asset.precision);
        rgbAssets.push({
          asset_id: asset.asset_id,
          symbol: asset.ticker ?? asset.name, // fallback if ticker missing
          name: asset.name,
          balance: balance.toLocaleString(),
          value: "$0.00", // replace with pricing logic if available
          change24h: 0,
          icon: defaultIcon,
        });
      }
    };
  
    processAssets(assetsData.nia, '🎨');
    processAssets(assetsData.uda, '🧩');
    processAssets(assetsData.cfa, '🖼️');
    processAssets(assetsData.ifa, '💠');
  
    setAssets(prev => upsertAssets(prev, rgbAssets));

  },[ assetsData]);

  const handleAssetClick = (asset: Asset) => {
    if (asset.symbol === "BTC") {
      // Navigate to send Bitcoin page for BTC asset
      navigate('/wallet/send-btc');
    } else {
      // Navigate to asset page for other assets
      navigate(`/wallet/asset/${asset.asset_id}`);
    }
  };

  
  return (
    <div className="space-y-6 py-1">
      {/* Asset List */}

      {btcLoading || assetsLoading ? (
       <TxSkeleton/>
      ) : (
        <div className="space-y-1 px-1">
          {assets.map((asset) => (
            <div 
              key={asset.symbol} 
              className="bg-card flex items-center justify-between p-4 border border-border rounded-lg hover:border-foreground/20 transition-colors cursor-pointer"
              onClick={() => handleAssetClick(asset)}
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-r from-[#EDEDE9] to-accent rounded-full flex items-center justify-center text-lg text-foreground uppercase">
                  {asset.symbol.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-left text-gray-dark">{asset.name}</p>
                  <p className="text-sm text-left text-foreground">{asset.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="">
                  {/* <p className="text-sm text-gray-dark">{asset.value}</p> */}
                  {/* <Badge variant={asset.change24h >= 0 ? "default" : "destructive"} className="text-xs">
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(asset.change24h)}%
                      </Badge> */}
                </div>
                <p className="font-medium text-foreground">{asset.balance} {asset.symbol}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};