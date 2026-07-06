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
  latest_rgs_snapshot_timestamp?: number | null
}
export interface RgbTransfer {
  idx: number;
  created_at: number;
  updated_at: number;
  status: string;
  requested_assignment: {
    type: string;
    value: number;
  } | null;
  assignments: Array<{
    type: string;
    value: number;
  }>;
  kind: string;
  txid: string | null;
  recipient_id: string | null;
  receive_utxo: string | null;
  change_utxo: string | null;
  expiration_timestamp: number | null;
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
  recipient_type?: 'Blind' | 'Witness' | string
  asset_schema: 'Nia' | 'Cfa' | 'Uda' | 'Ifa' | string
  network: 'Regtest' | 'Mainnet' | 'Testnet' | string
  expiration_timestamp: number

}
export interface WitnessData {
  amount_sat: number;
  blinding?: number | null;
}
export interface SendRGBAsset extends InvoiceBase {
  donation: boolean;
  fee_rate: number;
  min_confirmations: number;
  skip_sync?: boolean;
  witness_data?: WitnessData | null;
}

export interface RgbRecipient {
  recipient_id: string;
  witness_data?: WitnessData | null;
  assignment: Assignment;
  transport_endpoints: string[];
}

export interface SendRgbRequest {
  donation: boolean;
  fee_rate: number;
  min_confirmations: number;
  expiration_timestamp?: number | null;
  recipient_map: Record<string, RgbRecipient[]>;
}

export interface RgbInvoiceResponse {
  recipient_id: string;
  invoice: string;
  expiration_timestamp: number | null;
  batch_transfer_idx: number;
}

export interface ListTransfersResponse {
  transfers: RgbTransfer[];
  first_index_offset: number;
  last_index_offset: number;
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

export interface IfaAsset extends AssetBase {
  ticker: string;
}

export interface ListAssetsResponse {
  nia?: NiaAsset[] | null;
  uda?: UdaAsset[] | null;
  cfa?: CfaAsset[] | null;
  ifa?: IfaAsset[] | null;
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
  /** Number of pending blind receives reserving this UTXO */
  pending_blinded: number;
}

export interface ListUnspentsResponse {
  unspents: Unspent[];
  first_index_offset: number;
  last_index_offset: number;
}