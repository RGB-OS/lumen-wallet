import apiClient from './apiClient';
import { AddressResponse, BTCBalance, CreateUTXOsRequest, InvoiceDecoded, ListAssetsResponse, ListTransfersResponse, NetworkInfoResponse, NodeInfoResponse, SendRGBAsset } from '@/types/rgb-types';

type RGBInvoiceRequest = {
    asset_id?: string;
    amount?: number;
    duration_seconds: number;
    min_confirmations: number;
    witness: boolean;
    blind?: boolean;
};
type RgbInvoiceResponse = {
    invoice: string;
};
type DecodeInvoiceRequest = {
    invoice: string;
};
type TXIdResponse = {
    txid: string;
};
type SendBTCRequest = {
    amount: number;
    address: string;
    fee_rate: number;
    skip_sync: boolean;
};

class NodeService {

    async nodeinfo() {
        const res = await apiClient.get<NodeInfoResponse>('/nodeinfo');
        return res.data;
    }

    async networkinfo() {
        const res = await apiClient.get<NetworkInfoResponse>('/networkinfo');
        return res.data;
    }

    async btcbalance() {
        const res = await apiClient.post<BTCBalance>('/btcbalance', { skip_sync: true });
        return res.data;
    }

    async listassets() {
        const res = await apiClient.post<ListAssetsResponse>('/listassets', {
            filter_asset_schemas: ['Nia', 'Uda', 'Cfa'],
        });
        return res.data;
    }
    async listpeers() {
        const res = await apiClient.post('/listpeers', {});
        return res.data;
    }
    async listchannels() {
        const res = await apiClient.post('/listchannels', {});
        return res.data;
    }
    async getaddress() {
        const res = await apiClient.post<AddressResponse>('/address');
        return res.data;
    }

    async listtransfers({ assetId }: { assetId: string }) {
        const res = await apiClient.post<ListTransfersResponse>('/listtransfers', { asset_id: assetId });
        return res.data;
    }

    async rgbinvoice<RgbInvoiceResponse>(params?: RGBInvoiceRequest) {
        const {
            asset_id,
            amount,
            duration_seconds = 86400,
            min_confirmations = 1,
            witness = false,
            blind = false,
        } = params ?? {};
        
        // Build request body with only defined values
        const requestBody: any = {
            duration_seconds,
            min_confirmations,
            witness,
        };
        
    
        
        // Only include asset_id and amount if they are defined and it's not a blind invoice
        if (!blind && asset_id !== undefined) {
            requestBody.asset_id = asset_id;
        }
        if (!blind && amount !== undefined) {
            requestBody.amount = amount;
        }
        
        const res = await apiClient.post<RgbInvoiceResponse>('/rgbinvoice', requestBody);
        return res.data;
    }

    async decodergbinvoice(params: DecodeInvoiceRequest) {
        const res = await apiClient.post<InvoiceDecoded>('/decodergbinvoice', params);
        return res.data;
    }

    async failtransfer(params: { batch_transfer_idx: number }) {
        const { batch_transfer_idx = null } = params;
        if (batch_transfer_idx === null) {
            throw new Error('Missing required parameters for failtransfer');
        }
        const res = await apiClient.post('/failtransfers', { batch_transfer_idx, no_asset_only: false, skip_sync: true });
        return res.data;

    }

    async sendasset<TXIdResponse>(params: SendRGBAsset) {
        const {
            asset_id,
            recipient_id,
            assignment,
            transport_endpoints,
            donation = false,
            fee_rate = 5,
            min_confirmations = 1,
            skip_sync = false
        } = params;
        if (!asset_id || !recipient_id || !assignment || !transport_endpoints) {
            throw new Error('Missing required parameters for sendasset');
        }
        const res = await apiClient.post<TXIdResponse>('/sendasset', {
            asset_id,
            recipient_id,
            assignment,
            transport_endpoints,
            donation,
            fee_rate,
            min_confirmations,
            skip_sync
        });

        return res.data;
    }
    async refreshtransfers(params?: { skip_sync?: boolean }) {
        const {
            skip_sync = false
        } = params ?? {};

        const res = await apiClient.post('/refreshtransfers', { skip_sync });
        return res.data;
    }

    async createutxos(params: CreateUTXOsRequest) {
        const { up_to = false, num, size = 1000, fee_rate = 5, skip_sync = true } = params;
        if (!num) {
            throw new Error('Missing required parameters for createutxos');
        }
        const res = await apiClient.post('/createutxos', {
            up_to,
            num,
            size,
            fee_rate,
            skip_sync
        });
        return res.data;
    }

    async listunspents(params?: { skip_sync?: boolean }) {
        const { skip_sync = true } = params ?? {};
        const res = await apiClient.post('/listunspents', { skip_sync });
        return res.data;
    }

    async sync() {
        const res = await apiClient.post('/sync');
        return res.data;
    }

    async signmessage(params: { message: string }) {
        const { message } = params;
        if (!message) {
            throw new Error('Message is required for signmessage');
        }
        const res = await apiClient.post<{ signed_message: string }>('/signmessage', { message });
        return res.data;
    }

    async sendbtc(params: SendBTCRequest) {
        const { amount, address, fee_rate, skip_sync } = params;
        if (!amount || !address) {
            throw new Error('Missing required parameters for sendbtc');
        }
        const res = await apiClient.post<TXIdResponse>('/sendbtc', {
            amount, address, fee_rate, skip_sync
        });
        return res.data;
    }
}

export const nodeService = new NodeService();
