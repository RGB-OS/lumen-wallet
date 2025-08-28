import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, TrendingDown, Bitcoin } from "lucide-react";

// import { SignatureAuth } from "./SignatureAuth";
import { Wallet, Send, FileText, Settings, Copy, Eye } from "lucide-react";
import { AssetDisplay } from "./AssetDisplay";
import { TransactionForm } from "./TransactionForm";
import { useToastActions } from "@/hooks/useToastActions";

import { formatAddress, satoshisToBTC } from "@/utils";
import { BTCBalanceCard } from "./BTCBalanceCard";
import { Link } from "react-router-dom";
import { Header } from "./Header";
import { 
  useAddress, 
  useNetworkInfo 
} from "@/hooks/useWalletQueries";
// import { useToast } from "@/hooks/use-toast";

// interface WalletDashboardProps {
//     mnemonic: string;
//     onLogout: () => void;
// }

export const WalletDashboard = () => {
    const [publicKey, setPublicKey] = useState<string>("");
    const [showPrivateInfo, setShowPrivateInfo] = useState(false);
    const [totalValue, setTotalValue] = useState("0.00");

    const { showCopiedToClipboard, showError } = useToastActions();
    
    // React Query hooks
    const { 
      data: addressData, 
      isLoading: addressLoading, 
      error: addressError 
    } = useAddress();
    
    const { 
      data: networkData, 
      isLoading: networkLoading, 
      error: networkError 
    } = useNetworkInfo();

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showCopiedToClipboard(label);
        } catch (err) {
            showError("Copy Failed", "Failed to copy to clipboard");
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
                            {networkData ? (
                              <p className="text-sm text-muted-foreground opacity-60">{networkData.network}</p>
                            ) : networkLoading ? (
                              <p className="h-6 w-24 animate-pulse bg-gray-300 rounded"></p>
                            ) : networkError ? (
                              <p className="text-xs text-red-500">Network info unavailable</p>
                            ) : null}
                            <BTCBalanceCard />
                            {addressData ? (
                              <p className="text-sm text-muted-foreground opacity-70 flex items-center justify-center space-x-2">
                                <span>{formatAddress(addressData.address)}</span>
                                <Copy className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => copyToClipboard(addressData.address, "Address")} />
                              </p>
                            ) : addressLoading ? (
                              <p className="h-6 w-24 animate-pulse bg-gray-300 rounded"></p>
                            ) : addressError ? (
                              <p className="text-xs text-red-500">Address unavailable</p>
                            ) : null}
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