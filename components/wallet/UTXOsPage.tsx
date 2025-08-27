import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus } from 'lucide-react';
import { useRLNApi, useRLNState } from '@/providers/nodeProvider';
import { nodeService } from '@/services/nodeService';
import { ListUnspentsResponse, Unspent } from '@/types/rgb-types';
import { useToast } from '@/hooks/useToast';
import { formatAddress } from '@/utils';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer';
import { CreateUTXOForm } from './CreateUTXOForm';

export const UTXOsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { fetchApi } = useRLNApi();
  const { toast } = useToast();

  const key = 'listunspents';
  const {
    data: unspentsData,
    status: unspentsStatus,
    error: unspentsError,
    refetch,
  } = useRLNState<ListUnspentsResponse>(key);

  const unspents = unspentsData?.unspents ?? [];

  const fetchUnspents = async () => {
    console.log('Fetching unspents...');
    await fetchApi<ListUnspentsResponse>('listunspents', 'POST', { skip_sync: false });
  };

  useEffect(() => {
    fetchUnspents();
  }, []);

  // Filter unspents based on tab
  const getFilteredUnspents = () => {
    switch (activeTab) {
      case 'occupied':
        return unspents.filter(unspent => unspent.rgb_allocations.length > 0);
      case 'unoccupied':
        return unspents.filter(unspent => unspent.rgb_allocations.length === 0);
      case 'unlockable':
        return unspents.filter(unspent => 
          unspent.rgb_allocations.some(allocation => !allocation.settled)
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
        return unspents.filter(unspent => unspent.rgb_allocations.length > 0).length;
      case 'unoccupied':
        return unspents.filter(unspent => unspent.rgb_allocations.length === 0).length;
      case 'unlockable':
        return unspents.filter(unspent => 
          unspent.rgb_allocations.some(allocation => !allocation.settled)
        ).length;
      default:
        return unspents.length;
    }
  };

  const handleCreateUTXOSuccess = () => {
    setIsCreateFormOpen(false);
    fetchUnspents();
    toast({
      title: "UTXOs Created",
      description: "New UTXOs have been created successfully.",
    });
  };

  if (unspentsStatus === 'loading') {
    return <div className="p-6 text-sm">Loading UTXOs...</div>;
  }

  if (unspentsStatus === 'error') {
    return (
      <div className="p-6">
        <div className="text-sm text-red-500">
          <p>Error loading UTXOs: {unspentsError}</p>
          <Button variant="outline" size="sm" onClick={fetchUnspents} className="mt-2">
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
            Manage your unspent transaction outputs
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
            onClick={fetchUnspents}
            disabled={unspentsStatus === 'loading'}
          >
            <RefreshCw className={`h-4 w-4 ${unspentsStatus === 'loading' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({getTabCount('all')})
          </TabsTrigger>
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

        <TabsContent value="all" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} />
        </TabsContent>

        <TabsContent value="occupied" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} />
        </TabsContent>

        <TabsContent value="unoccupied" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} />
        </TabsContent>

        <TabsContent value="unlockable" className="space-y-4">
          <UTXOList unspents={filteredUnspents} formatBTCAmount={formatBTCAmount} />
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
}

const UTXOList: React.FC<UTXOListProps> = ({ unspents, formatBTCAmount }) => {
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
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-mono text-sm text-foreground">
                    {formatAddress(unspent.utxo.outpoint)}
                  </h3>
                  <Badge variant={unspent.utxo.colorable ? "default" : "secondary"}>
                    {unspent.utxo.colorable ? "Colorable" : "Non-colorable"}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  BTC Amount: {formatBTCAmount(unspent.utxo.btc_amount)} BTC
                </div>

                {unspent.rgb_allocations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      RGB Allocations ({unspent.rgb_allocations.length})
                    </p>
                    {unspent.rgb_allocations.map((allocation, allocIndex) => (
                      <div key={allocIndex} className="text-xs bg-muted p-2 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-mono">
                            {formatAddress(allocation.asset_id)}
                          </span>
                          <Badge variant={allocation.settled ? "default" : "secondary"}>
                            {allocation.settled ? "Settled" : "Unsettled"}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-1">
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
