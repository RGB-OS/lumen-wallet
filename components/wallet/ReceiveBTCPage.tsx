import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { useToastActions } from "@/hooks/useToastActions";
import { useAddress } from "@/hooks/useWalletQueries";
import { Copy } from "lucide-react";

export default function ReceiveBTCPage() {
    const { data: addressData, isLoading, error } = useAddress();
    const { showCopiedToClipboard, showError } = useToastActions();

    const copyAddress = async () => {
        if (!addressData?.address) return;
        try {
            await navigator.clipboard.writeText(addressData.address);
            showCopiedToClipboard("BTC address");
        } catch (e) {
            showError("Copy Failed", "Unable to copy address to clipboard");
        }
    };

    return (
        <div className="min-h-screen w-full">
            <Card className="py-4">
                <CardHeader>
                    <CardTitle>Receive Bitcoin (on-chain)</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {isLoading && <div className="h-6 w-24 animate-pulse bg-gray-300 rounded" />}
                    {error && <p className="text-sm text-red-500">Failed to load address</p>}
                    {addressData?.address && (
                        <>
                            <div className="bg-white p-4 rounded-lg">
                                <QRCode value={addressData.address} size={160} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{addressData.address}</span>
                                <Copy className="w-4 h-4 cursor-pointer hover:opacity-80" onClick={copyAddress} />
                            </div>
                            <Button onClick={copyAddress} className="mt-2" variant="outline">
                                Copy Address
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


