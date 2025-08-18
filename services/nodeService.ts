import api from './api';
import { AddressResponse, BTCBalance, InvoiceDecoded, ListTransfersResponse, NodeInfoResponse, SendRGBAsset } from '@/types/rgb-types';

type RGBInvoiceRequest = {
    asset_id: string | undefined;
    amount: number | undefined;
    duration_seconds: number;
    min_confirmations: number;
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

class NodeService {

    async nodeinfo() {
        return api.get<NodeInfoResponse>('/nodeinfo');
    }

    async btcbalance() {
        const res = await api.post<BTCBalance>('/btcbalance', { skip_sync: true });
        return res.data;
    }

    async listassets() {
        const res = await api.post('/listassets', {
            filter_asset_schemas: ['Nia', 'Uda', 'Cfa'],
        });
        return res.data;
    }
    async listpeers() {
        const res = await api.post('/listpeers', {});
        return res.data;
    }
    async listchannels() {
        const res = await api.post('/listchannels', {});
        return res.data;
    }
    async getaddress() {
        const res = await api.post<AddressResponse>('/address');
        return res.data;
    }

    async listtransfers({ assetId }: { assetId: string }) {
        const res = await api.post<ListTransfersResponse>('/listtransfers', { asset_id: assetId });
        return res.data;
    }

    async rgbinvoice(params?: RGBInvoiceRequest) {
        const {
            asset_id,
            amount,
            duration_seconds = 86400,
            min_confirmations = 1,
        } = params ?? {};
        const res = await api.post<RgbInvoiceResponse>('/rgbinvoice', {
            asset_id,
            amount,
            duration_seconds,
            min_confirmations,
        });
        return res.data;
    }

    async decodergbinvoice(params: DecodeInvoiceRequest) {
        const res = await api.post<InvoiceDecoded>('/decodergbinvoice', params);
        return res.data;
    }

    async sendasset(params: SendRGBAsset) {
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
        const res = await api.post<TXIdResponse>('/sendasset', {
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

        const res = await api.post('/refreshtransfers', { skip_sync });
        return res.data;
    }
}

export const nodeService = new NodeService();
