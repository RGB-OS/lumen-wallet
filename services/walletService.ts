import { nodeService } from "./nodeService";

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
        console.log('Enabled origins:', this.enabledOrigins);
        if (this.enabledOrigins.has(origin)) return { alias: 'ThunderStack' };
        console.log('Requesting user approval for origin:', origin);
        const url = browser.runtime.getURL(`/approval.html?origin=${encodeURIComponent(origin)}`);

        const popup = await browser.windows.create({
            url,
            type: 'popup',
            width: 360,
            height: 400,
        });

        return new Promise((resolve) => {
            const handler = (response: any, _sender: any, sendResponse: any) => {
                console.log('Received approval response:', response);
                if (response.type === 'webln-approval-response') {
                    browser.runtime.onMessage.removeListener(handler);
                    if (response.approved) {
                        this.enabledOrigins.add(origin);
                        resolve({ result: true });
                    } else {
                        resolve({ error: 'User denied access' });
                    }
                }
            };

            browser.runtime.onMessage.addListener(handler);
            console.log('Waiting for user approval...');
        });
    }
    /**
     * Check if the origin is enabled for WebLN access
     * @param origin The origin to check
     * @throws Error if the origin is not enabled
     */
    isEnabled(origin: string) {
        if (!this.enabledOrigins.has(origin)) {
            // throw new Error('webln.enable() not called for this origin');
            return false;
        }
        return true;
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
                methods: ['makeInvoice', 'sendPayment', 'keysend', 'getInfo', 'request.rgbinvoice', 'request.sendasset', 'request.listtransfers', 'request.address', 'request.listassets']
            }
        } catch (e) {
            console.error('Failed to get node info:', e);
            throw new Error('Failed to get info: ');
        }
    }

    async getBalance(origin: string = this.trustedOrigin): Promise<BalanceResponse> {
        this.isEnabled(origin);
        try {
            const res = await nodeService.btcbalance();
            return {
                balance: res.vanilla.spendable,
                currency: "sats"
            };
        } catch (e: any) {
            console.error('[getBalance] Error:', e);
            throw new WalletNodeError('get balance', e?.message ?? '');
        }
    }
    async handleCustomRequest(origin: string = this.trustedOrigin, method: string, params: any) {
        if (!this.enabledOrigins.has(origin)) {
            throw new WalletPermissionError(origin);
        }
        console.log(`[walletService] Handling request: ${method}`, params);
        try {
            switch (method) {
                case 'listpeers':
                    return await nodeService.listpeers();
                case 'listchannels':
                    return await nodeService.listchannels();
                case 'decodergbinvoice':
                    return await nodeService.decodergbinvoice(params);
                case 'rgbinvoice':
                    return await nodeService.rgbinvoice(params);
                case 'address':
                    return await nodeService.getaddress();
                case 'listassets':
                    return await nodeService.listassets();
                case 'listtransfers':
                    return await nodeService.listtransfers(params);
                case 'sendasset':
                    return await nodeService.sendasset(params);
                default:
                    throw new WalletError(`Unknown request method: ${method}`);
            }
        } catch (e: any) {
            console.error(`[walletService] Failed to handle ${method}:`, e);
            throw new WalletNodeError(method, e?.message);
        }
    }
}

export const walletService = new WalletService();

