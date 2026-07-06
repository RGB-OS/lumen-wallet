import apiClient from './apiClient';
import { AddressResponse, BTCBalance, CreateUTXOsRequest, InvoiceDecoded, ListAssetsResponse, ListTransfersResponse, ListUnspentsResponse, NetworkInfoResponse, NodeInfoResponse, RgbInvoiceResponse, RgbRecipient, SendRGBAsset, SendRgbRequest } from '@/types/rgb-types';

type RGBInvoiceRequest = {
    asset_id?: string;
    amount?: number;
    duration_seconds: number;
    min_confirmations: number;
    witness: boolean;
    blind?: boolean;
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

type RefreshFilter = {
    status: 'WaitingCounterparty' | 'WaitingConfirmations';
    incoming: boolean;
};

type SyncStrategy = 'FastSync' | 'FullSync' | 'FullScan';
type SyncKeychain = 'Colored' | { Vanilla: { lookback: number } };
type SyncParams = {
    keychain?: SyncKeychain;
    strategy?: SyncStrategy;
};

type ListTransactionsResponse = {
    transactions: Array<{
        transaction_type: string;
        txid: string;
        received: number;
        sent: number;
        fee: number;
        confirmation_time: {
            height: number;
            timestamp: number;
        } | null;
    }>;
    first_index_offset: number;
    last_index_offset: number;
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
            filter_asset_schemas: ['Nia', 'Uda', 'Cfa', 'Ifa'],
        });
        return res.data;
    }
    async listpeers() {
        const res = await apiClient.get('/listpeers');
        return res.data;
    }
    async listchannels() {
        const res = await apiClient.get('/listchannels');
        return res.data;
    }
    async getaddress() {
        const res = await apiClient.post<AddressResponse>('/address');
        return res.data;
    }

    async listtransfers({ assetId, txid }: { assetId?: string; txid?: string }) {
        const body: any = {};
        if (assetId !== undefined) body.asset_id = assetId;
        if (txid !== undefined) body.txid = txid;
        const res = await apiClient.post<ListTransfersResponse>('/listtransfers', body);
        return res.data;
    }

    async rgbinvoice(params?: RGBInvoiceRequest) {
        const {
            asset_id,
            amount,
            duration_seconds = 86400,
            min_confirmations = 1,
            witness = false,
            blind = false,
        } = params ?? {};

        // Invoice expiration is now an absolute unix timestamp
        const requestBody: any = {
            expiration_timestamp: Math.floor(Date.now() / 1000) + duration_seconds,
            min_confirmations,
            witness,
        };

        // Only include asset_id and assignment if they are defined and it's not a blind invoice
        if (!blind && asset_id !== undefined) {
            requestBody.asset_id = asset_id;
        }
        if (!blind && amount !== undefined) {
            requestBody.assignment = { type: 'Fungible', value: amount };
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

    async sendasset(params: SendRGBAsset) {
        const {
            asset_id,
            recipient_id,
            assignment,
            transport_endpoints,
            witness_data,
            donation = false,
            fee_rate = 5,
            min_confirmations = 1,
        } = params;
        if (!asset_id || !recipient_id || !assignment || !transport_endpoints) {
            throw new Error('Missing required parameters for sendasset');
        }
        // /sendasset was replaced by /sendrgb, which batches recipients per asset
        const recipient: RgbRecipient = {
            recipient_id,
            assignment,
            transport_endpoints,
        };
        if (witness_data) {
            recipient.witness_data = witness_data;
        }
        const requestBody: SendRgbRequest = {
            donation,
            fee_rate,
            min_confirmations,
            recipient_map: {
                [asset_id]: [recipient],
            },
        };
        const res = await apiClient.post<TXIdResponse>('/sendrgb', requestBody);

        return res.data;
    }
    async refreshtransfers(params?: { skip_sync?: boolean; asset_id?: string; filter?: RefreshFilter[] }) {
        const {
            skip_sync = false,
            asset_id,
            filter = [], // empty filter refreshes all transfers
        } = params ?? {};

        const body: any = { filter, skip_sync };
        if (asset_id !== undefined) body.asset_id = asset_id;

        const res = await apiClient.post('/refreshtransfers', body);
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

    async listunspents(params?: { skip_sync?: boolean; settled_only?: boolean }) {
        const { skip_sync = true, settled_only = false } = params ?? {};
        const res = await apiClient.post<ListUnspentsResponse>('/listunspents', { settled_only, skip_sync });
        return res.data;
    }

    async sync(params?: SyncParams) {
        const { keychain = 'Colored', strategy = 'FullSync' } = params ?? {};
        const res = await apiClient.post('/sync', { options: { keychain, strategy } });
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

    async listtransactions(params?: { skip_sync?: boolean }) {
        const { skip_sync = false } = params ?? {};
        const res = await apiClient.post<ListTransactionsResponse>('/listtransactions', { skip_sync });
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
