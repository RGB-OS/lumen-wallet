import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus } from 'lucide-react';
import { Unspent } from '@/types/rgb-types';
import { useToast } from '@/hooks/useToast';
import { useToastActions } from '@/hooks/useToastActions';
import { formatAddress } from '@/utils';
import { Icons } from '@/components/icons';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { CreateUTXOForm } from './CreateUTXOForm';
import {
  useListUnspents,
  useCreateUTXOs,
  useWalletRefetch
} from '@/hooks/useWalletQueries';

export const UTXOsPageRefactored = () => {
  const [activeTab, setActiveTab] = useState('occupied');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { toast } = useToast();
  const { showCopiedToClipboard, showError } = useToastActions();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopiedToClipboard(label);
    } catch (err) {
      showError("Copy Failed", "Failed to copy to clipboard");
    }
  };

  // React Query hooks
  const {
    data: unspentsData,
    isLoading,
    error,
    refetch,
    isFetching
  } = useListUnspents();

  const createUTXOsMutation = useCreateUTXOs();
  const { refetchUnspents } = useWalletRefetch();

  const unspents = unspentsData?.unspents ?? [];

  // Filter unspents based on tab
  const getFilteredUnspents = () => {
    switch (activeTab) {
      case 'occupied':
        return unspents.filter((unspent: Unspent) => unspent.rgb_allocations.length > 0);
      case 'unoccupied':
        return unspents.filter((unspent: Unspent) => unspent.rgb_allocations.length === 0);
      case 'unlockable':
        return unspents.filter((unspent: Unspent) =>
          unspent.rgb_allocations.some((allocation: any) => !allocation.settled)
        );
      default:
        return unspents;
    }
  };

  const filteredUnspents = getFilteredUnspents();

  const formatBTCAmount = (satoshi: number) => {
    return (satoshi / 100000000).toFixed(8);
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'occupied':
        return unspents.filter((unspent: Unspent) => unspent.rgb_allocations.length > 0).length;
      case 'unoccupied':
        return unspents.filter((unspent: Unspent) => unspent.rgb_allocations.length === 0).length;
      case 'unlockable':
        return unspents.filter((unspent: Unspent) =>
          unspent.rgb_allocations.some((allocation: any) => !allocation.settled)
        ).length;
      default:
        return unspents.length;
    }
  };

  const handleCreateUTXOSuccess = () => {
    setIsCreateFormOpen(false);
    refetchUnspents();
    toast({
      title: "UTXOs Created",
      description: "New UTXOs have been created successfully.",
    });
  };

  if (isLoading && !unspentsData) {
    return <div className="p-6 text-sm">Loading UTXOs...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-sm text-red-500">
          <p>Error loading UTXOs: {error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background space-y-6 px-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">UTXOs</h1>
          <p className="text-sm text-muted-foreground">
            {/* Manage your unspent transaction outputs */}
            {/* {isFetching && !isLoading && (
              <span className="ml-2 text-xs text-blue-500">(updating...)</span>
            )} */}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create UTXOs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {/* <TabsTrigger value="all">
            All ({getTabCount('all')})
          </TabsTrigger> */}
          <TabsTrigger value="occupied">
            Occupied ({getTabCount('occupied')})
          </TabsTrigger>
          <TabsTrigger value="unoccupied">
            Unoccupied ({getTabCount('unoccupied')})
          </TabsTrigger>
          <TabsTrigger value="unlockable">
            Unlockable ({getTabCount('unlockable')})
          </TabsTrigger>
        </TabsList>

        {/* <TabsContent value="all" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} copyToClipboard={copyToClipboard} />
        </TabsContent> */}

        <TabsContent value="occupied" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} copyToClipboard={copyToClipboard} />
        </TabsContent>

        <TabsContent value="unoccupied" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} copyToClipboard={copyToClipboard} />
        </TabsContent>

        <TabsContent value="unlockable" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} copyToClipboard={copyToClipboard} />
        </TabsContent>
      </Tabs>

      {/* Create UTXO Form Drawer */}
      <Drawer open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create UTXOs</DrawerTitle>
          </DrawerHeader>
          <CreateUTXOForm onSuccess={handleCreateUTXOSuccess} />
        </DrawerContent>
      </Drawer>
    </div>
  );
};

interface UTXOListProps {
  unspents: Unspent[];
  formatBTCAmount: (satoshi: number) => string;
  copyToClipboard: (text: string, label: string) => void;
}

const UTXOList: React.FC<UTXOListProps> = ({ unspents, formatBTCAmount, copyToClipboard }) => {
  if (unspents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No UTXOs found in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unspents.map((unspent, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow rounded-lg p-0" >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className='text-left'>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center gap-1 flex-1">
                      <h3 className="font-mono text-sm text-foreground">
                        {formatAddress(unspent.utxo.outpoint)}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(unspent.utxo.outpoint, 'UTXO Outpoint')}
                        className="h-4 w-4 p-0 hover:bg-muted"
                      >
                        <Icons.copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Badge variant={unspent.utxo.colorable ? "default" : "secondary"}>
                      {unspent.utxo.colorable ? "Colorable" : "Non-colorable"}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-dark mb-2">
                    BTC Amount: {formatBTCAmount(unspent.utxo.btc_amount)} BTC
                  </div>
                </div>
                {unspent.rgb_allocations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      RGB Allocations ({unspent.rgb_allocations.length})
                    </p>
                    {unspent.rgb_allocations.map((allocation, allocIndex) => (
                      <div key={allocIndex} className="text-xs bg-muted p-2 rounded">
                        <div className="flex space-x-2 items-center">
                          <div className="flex items-center gap-1 flex-1">
                            <span className="font-mono">
                              {formatAddress(allocation.asset_id)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(allocation.asset_id, 'Asset ID')}
                              className="h-4 w-4 p-0 hover:bg-muted"
                            >
                              <Icons.copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Badge variant={allocation.settled ? "default" : "secondary"}>
                            {allocation.settled ? "Settled" : "Unsettled"}
                          </Badge>
                        </div>
                        <div className="text-left text-xs text-gray-dark mt-1">
                          Type: {allocation.assignment.type} |
                          Value: {allocation.assignment.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
