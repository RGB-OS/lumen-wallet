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

import { formatAddress, satoshisToBTC } from "@/utils";
import { useRLNApi, useRLNState } from "@/providers/nodeProvider";
import { AddressResponse, BTCBalance, NetworkInfoResponse, NodeInfoResponse } from "@/types/rgb-types";
import { BTCBalanceCard } from "./BTCBalanceCard";
import { Link } from "react-router-dom";
import { Header } from "./Header";
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
        <div className="min-h-screen w-full  ">
            <Header />
            <Card className="py-4">

                <CardContent>
                    <div className="flex justify-center space-x-4">
                        {/* <div className="h-12 w-12 bg-gradient-to-r from-bitcoin to-accent rounded-full flex items-center justify-center">
              <Bitcoin className="h-6 w-6 text-bitcoin-foreground" />
            </div> */}
                        <div className="text-center">
                            {networkData.data ? <p className="text-sm text-muted-foreground opacity-60">{networkData.data?.network}</p> : <p className="h-6 w-24 animate-pulse bg-gray-300 rounded"></p>}
                            <BTCBalanceCard />
                            {/* <p className="text-xl font-bold text-bitcoin flex items-center space-x-2"><span>{totalValue} BTC </span><RefreshCw onClick={getBtcBalance} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /></p> */}
                            {addressData.data ?
                                <p className="text-sm text-muted-foreground opacity-70 flex items-center justify-center space-x-2"><span>{formatAddress(addressData.data.address)}</span>
                                    {/* <Button size="icon" variant="outline" > */}
                                    <Copy className="w-4 h-4" onClick={() => copyToClipboard(addressData.data?.address as string, "Address")} />
                                    {/* </Button> */}
                                </p>
                                : <p className="h-6 w-24 animate-pulse bg-gray-300 rounded"></p>}
                        </div>
                    </div>
                </CardContent>
                <CardContent className="flex justify-center space-x-4">
                    <TransactionButtons />
                </CardContent>
            </Card>

            <div className="max-w-6xl mx-auto ">
                <Tabs defaultValue="assets" className="w-full gap-0">
                    <TabsList className="grid w-full grid-cols-2 bg-card p-0 ">
                        <TabsTrigger className="" value="assets">Assets</TabsTrigger>
                        <TabsTrigger className="" value="nft ">Activities</TabsTrigger>
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
const TransactionButtons = () => {
    return <>
        <div className="flex flex-col items-center space-y-2">

            <Link to="/wallet/receive"> <Button className="size-16 text-foreground bg-white rounded-2xl" variant="outline" >
                <Icons.recive className="size-8" />
            </Button>
            </Link>
            <span>Recive</span>
        </div>

        <div className="flex flex-col items-center space-y-2">
            <Link to="/wallet/send">
                <Button className="size-16 text-foreground bg-white rounded-2xl" variant="outline" >
                    <Icons.send className="size-8" />
                </Button>
            </Link>
            <span>Send</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
            <Link to="/wallet/utxos">
                <Button className="size-16 bg-white rounded-2xl" variant="outline" >
                    <Icons.layers className="size-8" />
                </Button>
            </Link>
            <span>UTXOs</span>
        </div></>
}