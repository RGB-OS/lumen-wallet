import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, TrendingDown, Bitcoin } from "lucide-react";

// import { SignatureAuth } from "./SignatureAuth";
import { Wallet, Send, FileText, Settings, Copy, Eye } from "lucide-react";
import { AssetDisplay } from "./AssetDisplay";
import { TransactionForm } from "./TransactionForm";
import { useToast } from "@/hooks/useToast";
import { apiService } from "@/services/api";
import { formatAddress, satoshisToBTC } from "@/utils";
import { useRLNApi, useRLNState } from "@/providers/nodeProvider";
import { AddressResponse, BTCBalance, NetworkInfoResponse, NodeInfoResponse } from "@/types/rgb-types";
import { BTCBalanceCard } from "./BTCBalanceCard";
// import { useToast } from "@/hooks/use-toast";

// interface WalletDashboardProps {
//     mnemonic: string;
//     onLogout: () => void;
// }

export const WalletDashboard = () => {
    const [publicKey, setPublicKey] = useState<string>("");
    const [showPrivateInfo, setShowPrivateInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [totalValue, setTotalValue] = useState("0.00");

    const { toast } = useToast();
    const addressData = useRLNState<AddressResponse>('address');
    const networkData = useRLNState<NetworkInfoResponse>('networkinfo');

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: "Copied!",
                description: `${label} copied to clipboard`,
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy to clipboard",
                variant: "destructive",
            });
        }
    };

   

    return (
        <div className="min-h-screen w-full bg-background ">
            {/* Header */}
            <header className="bg-card border-b border-border">
                <div className=" px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 bg-gradient-to-r from-bitcoin to-accent rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-bitcoin-foreground" />
                        </div>
                        <div className="text-lg font-bold">Lumen</div>
                    </div>
                </div>
            </header>
            <Card className="py-4">

                <CardContent>
                    <div className="flex space-x-4">
                        {/* <div className="h-12 w-12 bg-gradient-to-r from-bitcoin to-accent rounded-full flex items-center justify-center">
              <Bitcoin className="h-6 w-6 text-bitcoin-foreground" />
            </div> */}
                        <div className="text-left">
                            {networkData.data?<p className="text-sm text-muted-foreground">{networkData.data?.network}</p>:<p className="h-6 w-24 animate-pulse bg-gray-300 rounded"></p>}
                            <BTCBalanceCard/>
                            {/* <p className="text-xl font-bold text-bitcoin flex items-center space-x-2"><span>{totalValue} BTC </span><RefreshCw onClick={getBtcBalance} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /></p> */}
                            {addressData.data?<p className="text-sm text-muted-foreground">{formatAddress(addressData.data.address)}</p>: <p className="h-6 w-24 animate-pulse bg-gray-300 rounded"></p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-6xl mx-auto ">
                <Tabs defaultValue="assets" className="w-full gap-0">
                    <TabsList className="grid w-full grid-cols-2 bg-card p-0">
                        <TabsTrigger value="assets">RGB 20</TabsTrigger>
                        <TabsTrigger value="nft ">NFT</TabsTrigger>
                        {/* <TabsTrigger value="transaction">Transaction</TabsTrigger> */}
                        {/* <TabsTrigger value="signature">Signature Auth</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="assets" className="space-y-4">
                        <AssetDisplay />
                    </TabsContent>

                    <TabsContent value="nft" className="space-y-4">
                        <TransactionForm publicKey={publicKey} />
                    </TabsContent>

                    {/* <TabsContent value="signature" className="space-y-4">
                        <SignatureAuth publicKey={publicKey} mnemonic={mnemonic} />
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    );
};