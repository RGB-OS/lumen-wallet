import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, QrCode, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/useToast";


interface TransactionFormProps {
  publicKey: string;
}

export const TransactionForm = ({ publicKey }: TransactionFormProps) => {
  const [sendForm, setSendForm] = useState({
    to: "",
    amount: "",
    fee: "0.00001",
    message: ""
  });
  const [invoice, setInvoice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSendTransaction = async () => {
    if (!sendForm.to || !sendForm.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate transaction signing with bitcoindevkit
    try {
      toast({
        title: "Transaction Initiated",
        description: "Signing transaction with @metamask/bitcoindevkit...",
      });

      // Mock transaction signing process
      setTimeout(() => {
        toast({
          title: "Transaction Sent!",
          description: `Sent ${sendForm.amount} BTC to ${sendForm.to.slice(0, 8)}...`,
        });
        setSendForm({ to: "", amount: "", fee: "0.00001", message: "" });
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to sign or broadcast transaction",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleCreateInvoice = () => {
    if (!sendForm.amount) {
      toast({
        title: "Error",
        description: "Please enter an amount for the invoice",
        variant: "destructive",
      });
      return;
    }

    // Generate mock invoice
    const invoiceData = `bitcoin:${publicKey}?amount=${sendForm.amount}&message=${encodeURIComponent(sendForm.message || 'Payment Request')}`;
    setInvoice(invoiceData);
    
    toast({
      title: "Invoice Created",
      description: "Payment request generated successfully",
    });
  };

  const copyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(invoice);
      toast({
        title: "Copied!",
        description: "Invoice copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send Bitcoin</TabsTrigger>
          <TabsTrigger value="receive">Create Invoice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Send Bitcoin</span>
              </CardTitle>
              <CardDescription>
                Send BTC using @metamask/bitcoindevkit for transaction signing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to-address">Recipient Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="to-address"
                    placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                    value={sendForm.to}
                    onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (BTC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Network Fee (BTC)</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.00000001"
                    value={sendForm.fee}
                    onChange={(e) => setSendForm({ ...sendForm, fee: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a note for this transaction..."
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  Total: {parseFloat(sendForm.amount || "0") + parseFloat(sendForm.fee)} BTC 
                  (Amount + Fee)
                </span>
              </div>

              <Button 
                onClick={handleSendTransaction} 
                className="w-full"
                disabled={isProcessing || !sendForm.to || !sendForm.amount}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Signing Transaction...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Bitcoin
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Payment Invoice</span>
              </CardTitle>
              <CardDescription>
                Generate a payment request for receiving Bitcoin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-amount">Amount (BTC)</Label>
                  <Input
                    id="invoice-amount"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Address</Label>
                  <Badge variant="outline" className="p-2 text-xs font-mono">
                    {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-message">Payment Description</Label>
                <Textarea
                  id="invoice-message"
                  placeholder="What is this payment for?"
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  rows={3}
                />
              </div>

              <Button onClick={handleCreateInvoice} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>

              {invoice && (
                <div className="space-y-2">
                  <Label>Generated Invoice</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-xs break-all">{invoice}</code>
                  </div>
                  <Button variant="outline" onClick={copyInvoice} className="w-full">
                    Copy Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};