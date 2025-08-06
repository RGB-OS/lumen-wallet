import { nodeService } from "./nodeService";

class WalletService {
    private enabledOrigins = new Set<string>();
    /**
     * Trusted origin for WebLN access
     * This is used to identify the origin that is allowed to access WebLN methods
     */
    private trustedOrigin = 'internal';
    /**
     * Enable WebLN access for a specific origin
     * @param origin The origin to enable
     * @returns An object with node alias
     * @throws Error if the user denies access
     */
    async enable(origin: string) {
        console.log('Enabling WebLN for origin:', origin);
        if (this.enabledOrigins.has(origin)) return { alias: 'ThunderStack' };
        const approved = confirm(`Allow ${origin} to access your RGB wallet?`);
        if (!approved) throw new Error('Access denied by user');
        this.enabledOrigins.add(origin);
        return { alias: 'ThunderStack' };
    }
    /**
     * Check if the origin is enabled for WebLN access
     * @param origin The origin to check
     * @throws Error if the origin is not enabled
     */
    isEnabled(origin: string) {
        if (!this.enabledOrigins.has(origin)) {
            throw new Error('webln.enable() not called for this origin');
        }
    }

    /**
     * Get information about the node
     * @param origin The origin of the request
     * @returns Node information including alias and pubkey
     * @throws Error if the node info cannot be retrieved
     */
    async getInfo(origin: string = this.trustedOrigin): Promise<GetInfoResponse> {
        this.isEnabled(origin);
        try {
            const res = await nodeService.nodeinfo();
            const { data } = res;
            return {
                node: {
                    alias: 'ThunderStack',
                    pubkey: data.pubkey,
                },
                methods: ['makeInvoice', 'sendPayment', 'keysend', 'getInfo']
            }
        } catch (e) {
            throw new Error('Failed to get info: ');
        }
    }
    
    async getBalance(origin: string = this.trustedOrigin): Promise<number> {
        this.isEnabled(origin);
        try {
            const res = await nodeService.btcbalance();
            return res.data.vanilla.spendable;
        } catch (e) {
            throw new Error('Failed to get balance');
        }
    }
}

export const walletService = new WalletService();


interface GetInfoResponse {
    node: {
        alias: string;
        pubkey: string;
        color?: string;
    },
    // "request.*" methods are not supported by all connectors
    // (see webln.request for more info)
    methods: string[]; // e.g. "makeInvoice", "sendPayment", "request.openchannel", ...
}
type BalanceResponse = {
    balance: number;
    currency?: "sats" | "EUR" | "USD"
}