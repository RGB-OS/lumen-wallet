
import { RefreshCw, TrendingUp, TrendingDown, Bitcoin, Send, Download, Coins, User } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { formatAddress } from "@/utils";
import { Card, CardContent } from "../ui/card";

export const TransactionsDisplay = ({ 
    transactions, 
    isLoading, 
    error,
    onTransactionClick
  }: { 
    transactions: any[]; 
    isLoading: boolean; 
    error: any;
    onTransactionClick: (transaction: any) => void;
  }) => {
    const getTransactionIcon = (type: string) => {
      switch (type) {
        case 'RgbSend':
          return <Send className="h-5 w-5" />;
        case 'Drain':
          return <Download className="h-5 w-5" />;
        case 'CreateUtxos':
          return <Coins className="h-5 w-5" />;
        case 'User':
          return <User className="h-5 w-5" />;
        default:
          return <Bitcoin className="h-5 w-5" />;
      }
    };
  
    const getTransactionColor = (type: string) => {
      switch (type) {
        case 'RgbSend':
          return 'bg-red-500';
        case 'Drain':
          return 'bg-blue-500';
        case 'CreateUtxos':
          return 'bg-green-500';
        case 'User':
          return 'bg-purple-500';
        default:
          return 'bg-gray-500';
      }
    };
  
    if (isLoading) return <div className="p-6">Loading transactions...</div>;
    if (error) return <div className="p-6 text-destructive">Failed to load transactions</div>;
    if (!transactions || transactions.length === 0) return <div className="p-6 text-muted-foreground">No transactions found</div>;
  
    return (
      <div className="space-y-1 py-1  px-1">
        {transactions.map((tx) => (
          <div 
            key={tx.txid} 
            className="bg-card flex flex-row p-4 border border-border rounded-lg hover:border-foreground/20 transition-colors cursor-pointer text-foreground"
            onClick={() => onTransactionClick(tx)}
          >
            <div className={twMerge("h-10 w-10 text-white rounded-full flex items-center justify-center", getTransactionColor(tx.transaction_type))}>
              {getTransactionIcon(tx.transaction_type)}
            </div>
  
            <div className='flex-1 flex flex-row justify-between items-center ml-4'>
              <div className='text-left'>
                <div className="text-sm font-semibold text-foreground">
                  {tx.transaction_type}
                </div>
                {tx.confirmation_time?.timestamp && (
                  <div className="text-xs text-gray-dark mt-1">
                    {new Date(tx.confirmation_time.timestamp * 1000).toLocaleString()}
                  </div>
                )}
              </div>
              <div className='text-right'>
                <div className="flex items-center justify-end gap-2">
                  {tx.received > 0 && (
                    <span className="text-sm font-semibold text-green-600">
                      +{tx.received.toLocaleString()} sats
                    </span>
                  )}
                  {tx.sent > 0 && (
                    <span className="text-sm font-semibold text-red-600">
                      -{tx.sent.toLocaleString()} sats
                    </span>
                  )}
                </div>
                
                <div className="text-xs mt-1 font-mono truncate text-gray-dark">
                  tx: {formatAddress(tx.txid)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  export const TransactionDetails = ({ 
    transaction, 
    onClose 
  }: { 
    transaction: any; 
    onClose: () => void; 
  }) => {
    const getTransactionIcon = (type: string) => {
      switch (type) {
        case 'RgbSend':
          return <Send className="h-6 w-6" />;
        case 'Drain':
          return <Download className="h-6 w-6" />;
        case 'CreateUtxos':
          return <Coins className="h-6 w-6" />;
        case 'User':
          return <User className="h-6 w-6" />;
        default:
          return <Bitcoin className="h-6 w-6" />;
      }
    };
  
    const getTransactionColor = (type: string) => {
      switch (type) {
        case 'RgbSend':
          return 'bg-red-500';
        case 'Drain':
          return 'bg-blue-500';
        case 'CreateUtxos':
          return 'bg-green-500';
        case 'User':
          return 'bg-purple-500';
        default:
          return 'bg-gray-500';
      }
    };
  
    const formatDate = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleString();
    };
  
    return (
      <>
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[60vh] px-6 pb-6 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div className={twMerge("h-12 w-12 text-white rounded-full flex items-center justify-center", getTransactionColor(transaction.transaction_type))}>
              {getTransactionIcon(transaction.transaction_type)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {transaction.transaction_type}
              </h3>
              <div className="text-sm text-muted-foreground mt-1">
                {transaction.confirmation_time?.timestamp && formatDate(transaction.confirmation_time.timestamp)}
              </div>
            </div>
          </div>
  
          {/* Transaction Details */}
          <Card className='rounded-lg shadow-md'>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-dark uppercase tracking-wide">Transaction ID</label>
                  <p className="text-sm font-mono break-all mt-1">
                    {transaction.txid}
                  </p>
                </div>
                {transaction.confirmation_time?.height && (
                  <div>
                    <label className="text-xs text-gray-dark uppercase tracking-wide">Block Height</label>
                    <p className="text-sm mt-1">#{transaction.confirmation_time.height}</p>
                  </div>
                )}
                {transaction.confirmation_time?.timestamp && (
                  <div>
                    <label className="text-xs text-gray-dark uppercase tracking-wide">Timestamp</label>
                    <p className="text-sm mt-1">{formatDate(transaction.confirmation_time.timestamp)}</p>
                  </div>
                )}
                {transaction.received > 0 && (
                  <div>
                    <label className="text-xs text-gray-dark uppercase tracking-wide">Received</label>
                    <p className="text-sm mt-1 text-green-600 font-medium">
                      +{transaction.received.toLocaleString()} sats
                    </p>
                  </div>
                )}
                {transaction.sent > 0 && (
                  <div>
                    <label className="text-xs text-gray-dark uppercase tracking-wide">Sent</label>
                    <p className="text-sm mt-1 text-red-600 font-medium">
                      -{transaction.sent.toLocaleString()} sats
                    </p>
                  </div>
                )}
                {transaction.fee > 0 && (
                  <div>
                    <label className="text-xs text-gray-dark uppercase tracking-wide">Fee</label>
                    <p className="text-sm mt-1">{transaction.fee} sats</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };