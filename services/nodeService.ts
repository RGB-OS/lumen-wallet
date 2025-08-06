import api from './api';
import { AddressResponse, BTCBalance, ListTransfersResponse, NodeInfoResponse } from '@/types/rgb-types';

class NodeService {
 
    async nodeinfo() {
        return api.get<NodeInfoResponse>('/nodeinfo');
    }

   

    async btcbalance() {
        return api.post<BTCBalance>('/btcbalance', { skip_sync: false });
    }

    async listassets() {
        return api.post('/listassets', {
            filter_asset_schemas: ['Nia', 'Uda', 'Cfa'],
        });
    }

    async getAddress() {
        return api.post<AddressResponse>('/address');
    }

    async listTransfers(assetId: string) {
        return api.post<ListTransfersResponse>('/listtransfers', { asset_id: assetId });
    }

    async rgbinvoice(assetId: string, duration_seconds: number = 86400, min_confirmations = 1) {
        return api.post('/rgbinvoice', {
            asset_id: assetId,
            duration_seconds,
            min_confirmations,
        });
    }
}

export const nodeService = new NodeService();
