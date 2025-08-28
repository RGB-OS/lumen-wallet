import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, Bitcoin } from "lucide-react";
import { satoshisToBTC } from "@/utils";
import { Asset } from "@/types/rgb-types";
import { Link } from "react-router-dom";
import { useBTCBalance, useListAssets } from "@/hooks/useWalletQueries";



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

    const processAssets = (list?: Array<any>, defaultIcon = '🎨') => {
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
  
    setAssets(prev => upsertAssets(prev, rgbAssets));

  },[ assetsData]);

  
  return (
    <div className="space-y-6 py-1">
      {/* Asset List */}

      {btcLoading || assetsLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-4 border border-border rounded-lg animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1 px-1">
          {assets.map((asset) => (
            <Link to={`/wallet/asset/${asset.asset_id}`} key={asset.symbol} className=" bg-card flex items-center justify-between p-4 border border-border rounded-lg hover:border-foreground/20  transition-colors cursor-ponter">
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
                  <p className="text-sm text-gray-dark">{asset.value}</p>
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
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};