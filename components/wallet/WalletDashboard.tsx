import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, TrendingDown, Bitcoin, Send, Download, Coins, User, CheckCircle } from "lucide-react";

// import { SignatureAuth } from "./SignatureAuth";
import { Wallet, FileText, Settings, Copy, Eye } from "lucide-react";
import { AssetDisplay } from "./AssetDisplay";
import { TransactionForm } from "./TransactionForm";
import { useToastActions } from "@/hooks/useToastActions";

import { formatAddress, satoshisToBTC } from "@/utils";
import { BTCBalanceCard } from "./BTCBalanceCard";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { 
  useAddress, 
  useNetworkInfo,
  useListTransactions
} from "@/hooks/useWalletQueries";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Icons } from "@/components/icons";
import { twMerge } from "tailwind-merge";
import { TransactionButtons } from "./TransactionButtons";
import { TransactionDetails, TransactionsDisplay } from "./TransactionsDisplay";

// interface WalletDashboardProps {
//     mnemonic: string;
//     onLogout: () => void;
// }

export const WalletDashboard = () => {
    const [publicKey, setPublicKey] = useState<string>("");
    const [showPrivateInfo, setShowPrivateInfo] = useState(false);
    const [totalValue, setTotalValue] = useState("0.00");
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
    const [transactionInfo, setTransactionInfo] = useState<any>(null);

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

    const {
      data: transactionsData,
      isLoading: transactionsLoading,
      error: transactionsError
    } = useListTransactions();

    // Check for transaction info from navigation state
    useEffect(() => {
      const location = window.location;
      const searchParams = new URLSearchParams(location.search);
      const state = history.state;
      
      if (state?.showTransaction && state?.transaction) {
        setTransactionInfo(state.transaction);
        setShowTransactionSuccess(true);
        // Clear the state
        history.replaceState({}, '', location.pathname);
      }
    }, []);

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showCopiedToClipboard(label);
        } catch (err) {
            showError("Copy Failed", "Failed to copy to clipboard");
        }
    };

    const handleTransactionClick = (transaction: any) => {
      setSelectedTransaction(transaction);
      setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
      setDrawerOpen(false);
      setSelectedTransaction(null);
    };

    const handleCloseTransactionSuccess = () => {
      setShowTransactionSuccess(false);
      setTransactionInfo(null);
    };

    return (
        <div className="min-h-screen w-full  ">
            <Header />
            
            {/* Transaction Success Banner */}
            {showTransactionSuccess && transactionInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg mx-4 mt-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">
                        {transactionInfo.type === 'BTC_Send' ? 'Bitcoin Sent Successfully!' : 'Transaction Successful!'}
                      </h3>
                      <p className="text-sm text-green-600">
                        TX ID: {transactionInfo.txid}
                      </p>
                      {transactionInfo.amount && (
                        <p className="text-sm text-green-600">
                          Amount: {transactionInfo.amount} sats
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCloseTransactionSuccess}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

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
                        <TabsTrigger className="" value="activities">Activities</TabsTrigger>
                        {/* <TabsTrigger value="transaction">Transaction</TabsTrigger> */}
                        {/* <TabsTrigger value="signature">Signature Auth</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="assets" className="space-y-4">
                        <AssetDisplay />
                    </TabsContent>

                    <TabsContent value="activities" className="space-y-4">
                        <TransactionsDisplay 
                          transactions={transactionsData?.transactions || []}
                          isLoading={transactionsLoading}
                          error={transactionsError}
                          onTransactionClick={handleTransactionClick}
                        />
                    </TabsContent>

                    {/* <TabsContent value="signature" className="space-y-4">
                        <SignatureAuth publicKey={publicKey} mnemonic={mnemonic} />
                    </TabsContent> */}
                </Tabs>
            </div>

      {/* Transaction Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          {/* <DrawerHeader>
            <DrawerTitle>Transaction Details</DrawerTitle>
          </DrawerHeader> */}
          {selectedTransaction && (
            <TransactionDetails
              transaction={selectedTransaction}
              onClose={handleCloseDrawer}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};
