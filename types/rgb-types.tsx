export interface NodeInfoResponse {
  pubkey: string
  num_channels: number
  num_usable_channels: number
  local_balance_sat: number
  eventual_close_fees_sat: number
  pending_outbound_payments_sat: number
  num_peers: number
  account_xpub_vanilla: string
  account_xpub_colored: string
  max_media_upload_size_mb: number
  rgb_htlc_min_msat: number
  rgb_channel_capacity_min_sat: number
  channel_capacity_min_sat: number
  channel_capacity_max_sat: number
  channel_asset_min_amount: number
  channel_asset_max_amount: number
  network_nodes: number
  network_channels: number
}
export interface RgbTransfer {
  idx: number;
  created_at: number;
  updated_at: number;
  status: string;
  requested_assignment: {
    type: string;
    value: number;
  };
  assignments: Array<{
    type: string;
    value: number;
  }>;
  kind: string;
  txid: string;
  recipient_id: string;
  receive_utxo: string;
  change_utxo: string | null;
  expiration: number;
  transport_endpoints: Array<{
    endpoint: string;
    transport_type: string;
    used: boolean;
  }>;
}
export interface Assignment {
  type: 'Fungible' | string  // You can make this a union if there are other types
  value: number
}
interface InvoiceBase {
  recipient_id: string

  asset_id: string
  assignment: Assignment
  transport_endpoints: string[]
}
export interface InvoiceDecoded extends InvoiceBase {
  asset_schema: 'Nia' | 'Cfa' | 'Uda' | string
  network: 'Regtest' | 'Mainnet' | 'Testnet' | string
  expiration_timestamp: number

}
export interface SendRGBAsset extends InvoiceBase {
  donation: boolean;
  fee_rate: number;
  min_confirmations: number;
  skip_sync: boolean;
}

export interface ListTransfersResponse {
  transfers: RgbTransfer[];
}

export enum TransferStatus {
  WAITING_COUNTERPARTY = 0,
  WAITING_CONFIRMATIONS,
  SETTLED,
  FAILED,
}
export interface NetworkInfoResponse {
  network: string,
  height: number
}
export interface AddressResponse {
  address: string;
}
export interface BTCBalance {
  vanilla: {
    settled: number;
    future: number;
    spendable: number;
  };
  colored: {
    settled: number;
    future: number;
    spendable: number;
  };
}

export interface Asset {
  asset_id: string;
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change24h: number;
  icon: string;
}

export interface AssetBalance {
  settled: number;
  future: number;
  spendable: number;
  offchain_outbound: number;
  offchain_inbound: number;
}

export interface AssetMedia {
  file_path: string;
  mime: string;
}

export interface AssetBase {
  asset_id: string;
  name: string;
  details: string;
  precision: number;
  issued_supply: number;
  timestamp: number;
  added_at: number;
  balance: AssetBalance;
  media: AssetMedia;
}

export interface UdaAttachment {
  file_path: string;
  digest: string;
  mime: string;
}

export interface UdaToken {
  index: number;
  ticker: string;
  name: string;
  details: string;
  embedded_media: boolean;
  media: AssetMedia;
  attachments: Record<string, UdaAttachment>;
  reserves: boolean;
}

export interface NiaAsset extends AssetBase {
  ticker: string;
}

export interface UdaAsset extends AssetBase {
  ticker: string;
  token: UdaToken;
}

export interface CfaAsset extends AssetBase {
  ticker: string;// TODO: clirify if this is correct
}

export interface ListAssetsResponse {
  nia: NiaAsset[];
  uda: UdaAsset[];
  cfa: CfaAsset[];
}

export interface CreateUTXOsRequest {
  up_to?: boolean,
  num: number,
  size?: number,
  fee_rate?: number,
  skip_sync?: boolean 
}

export interface CreateUTXOsResponse {

}

export interface RGBAllocation {
  asset_id: string;
  assignment: {
    type: string;
    value: number;
  };
  settled: boolean;
}

export interface UTXO {
  outpoint: string;
  btc_amount: number;
  colorable: boolean;
}

export interface Unspent {
  utxo: UTXO;
  rgb_allocations: RGBAllocation[];
}

export interface ListUnspentsResponse {
  unspents: Unspent[];
}