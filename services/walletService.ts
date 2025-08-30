import { authService } from "./authService";
import { nodeService } from "./nodeService";
import { WalletError, WalletPermissionError } from '@/utils/wallet-errors';

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
        if (this.enabledOrigins.has(origin)) {
            const authorized = await authService.isAuthenticated();
            if (!authorized) {
                console.warn('User is not authenticated, opening login popup');
                await this.openLoginPopup();
            }
            return
        }
        console.log('Requesting user approval for origin:', origin, `/popup.html#/approval?origin=${encodeURIComponent(origin)}`);
        const url = browser.runtime.getURL(`/popup.html#/approval?origin=${encodeURIComponent(origin)}`);

        const popup = await browser.windows.create({
            url,
            type: 'popup',
            width: 420,
            height: 620,
        });

        const approved = await new Promise((resolve) => {
            const handler = (response: any, _sender: any, sendResponse: any) => {
                console.log('Received approval response:', response);
                if (response.type === 'webln-approval-response') {
                    browser.runtime.onMessage.removeListener(handler);
                    resolve(response.approved);
                }
            };

            browser.runtime.onMessage.addListener(handler);
            console.log('Waiting for user approval...');
        });
        if (!approved) {
            throw new WalletPermissionError(origin);
        }
        this.enabledOrigins.add(origin);
        const authorized = await authService.isAuthenticated();
        if (!authorized) {
            console.warn('User is not authenticated, opening login popup');
            await this.openLoginPopup();
        }
        return
    }
    /**
     * Check if the origin is enabled for WebLN access
     * @param origin The origin to check
     * @throws Error if the origin is not enabled
     */
    async isEnabled(origin: string) {
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
        console.log('Getting node info for origin:', origin);
        if (!this.enabledOrigins.has(origin)) {
            throw new WalletPermissionError(origin);
        }
        const session = await authService.isAuthenticated();
        if (!session) throw new WalletPermissionError('User not authenticated');

        try {
            const data = await nodeService.nodeinfo();

            return {
                node: {
                    alias: 'ThunderStack',
                    pubkey: data.pubkey,
                },
                methods: ['makeInvoice', 'sendPayment', 'keysend', 'getInfo', 'request.rgbinvoice', 'request.sendasset', 'request.listtransfers', 'request.address', 'request.listassets', 'request.refreshtransfers']
            }
        } catch (e: any) {
            console.error('Failed to get node info:', e);
            throw new WalletNodeError('getInfo', e?.message);
        }
    }

    async getBalance(origin: string = this.trustedOrigin): Promise<BalanceResponse> {
        if (!this.enabledOrigins.has(origin)) {
            throw new WalletPermissionError(origin);
        }
        const session = await authService.isAuthenticated();
        if (!session) throw new WalletPermissionError('User not authenticated');
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
        const session = await authService.isAuthenticated();
        if (!session) throw new WalletPermissionError('User not authenticated');
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
                    // Show invoice generation confirmation popup for external requests
                    if (origin !== this.trustedOrigin) {
                        return await this.openInvoiceGenerationConfirmationPopup(params);
                    }
                    return await nodeService.rgbinvoice(params);
                case 'address':
                    return await nodeService.getaddress();
                case 'listassets':
                    return await nodeService.listassets();
                case 'listtransfers':
                    return await nodeService.listtransfers(params);
                case 'sendasset':
                    // Show transaction confirmation popup for external requests
                    return await this.openTransactionConfirmationPopup(params);
                    // return await nodeService.sendasset(params);
                case 'createutxos':
                    return await nodeService.createutxos(params);
                case 'refreshtransfers':
                    return await nodeService.refreshtransfers(params);
                case 'signmessage':
                    // Show message signing confirmation popup for external requests
                    return await this.openMessageSigningConfirmationPopup(params);
                    // return await nodeService.signmessage(params);
                default:
                    throw new WalletError(`Unknown request method: ${method}`);
            }
        } catch (e: any) {
            console.error(`[walletService] Failed to handle ${method}:`, e);
            throw new WalletNodeError(method, e?.message);
        }
    }



    private async openLoginPopup(): Promise<void> {
        const loginUrl = browser.runtime.getURL('/popup.html#/login?from=external');
        await browser.windows.create({
            url: loginUrl,
            type: 'popup',
            width: 420,
            height: 620,
        });

        await new Promise<void>((resolve, reject) => {
            const handler = (msg: any) => {
                if (msg.type === 'wallet-auth-response') {
                    browser.runtime.onMessage.removeListener(handler);
                    if (msg.success) {
                        resolve();
                    } else {
                        reject(new WalletPermissionError('Wrong credentials'));
                    }
                }
            };
            browser.runtime.onMessage.addListener(handler);
        });
    }

    async openTransactionConfirmationPopup(transactionData: any): Promise<any> {
        // Handle different assignment structures (amount vs value, type vs default)
        const assignment = transactionData.assignment || {};
        const assignmentValue = assignment.value || assignment.amount || 0;
        const assignmentType = assignment.type || 'Fungible'; // Default to Fungible if not specified

        // Build URL with transaction data as query parameters
        const params = new URLSearchParams({
            recipient_id: transactionData.recipient_id,
            asset_id: transactionData.asset_id,
            assignment_type: assignmentType,
            assignment_value: assignmentValue.toString(),
            transport_endpoints: transactionData.transport_endpoints.join(','),
            donation: transactionData.donation?.toString() || 'false',
            fee_rate: transactionData.fee_rate?.toString() || '5', // Default to medium fee rate
            min_confirmations: transactionData.min_confirmations?.toString() || '1', // Default to 1 confirmation
            skip_sync: transactionData.skip_sync?.toString() || 'false'
        });

        const confirmUrl = browser.runtime.getURL(`/popup.html#/confirm-transaction?${params.toString()}`);

        const popup = await browser.windows.create({
            url: confirmUrl,
            type: 'popup',
            width: 420,
            height: 720,
        });

        return new Promise<any>((resolve, reject) => {
            const handler = (msg: any) => {
                if (msg.type === 'transaction-confirmation-response') {
                    browser.runtime.onMessage.removeListener(handler);
                    if (msg.success) {
                        resolve(msg.result);
                    } else {
                        reject(new WalletError(msg.error || 'Transaction rejected'));
                    }
                }
            };
            browser.runtime.onMessage.addListener(handler);
        });
    }

    private async openMessageSigningConfirmationPopup(messageData: any): Promise<any> {
        // Build URL with message data as query parameters
        const params = new URLSearchParams({
            message: messageData.message
        });

        console.log('Opening message signing confirmation popup with params:', messageData);
        const confirmUrl = browser.runtime.getURL(`/popup.html#/confirm-message-signing?${params.toString()}`);

        const popup = await browser.windows.create({
            url: confirmUrl,
            type: 'popup',
            width: 420,
            height: 600,
        });

        return new Promise<any>((resolve, reject) => {
            const handler = (msg: any) => {
                if (msg.type === 'message-signing-response') {
                    browser.runtime.onMessage.removeListener(handler);
                    if (msg.success) {
                        resolve(msg.result);
                    } else {
                        reject(new WalletError(msg.error || 'Message signing cancelled'));
                    }
                }
            };
            browser.runtime.onMessage.addListener(handler);
        });
    }

    async openInvoiceGenerationConfirmationPopup(invoiceData: any): Promise<any> {
        // Build URL with invoice data as query parameters
        const params = new URLSearchParams();
        
        if (invoiceData.asset_id) {
            params.append('asset_id', invoiceData.asset_id);
        }
        if (invoiceData.amount) {
            params.append('amount', invoiceData.amount.toString());
        }
        params.append('duration_seconds', invoiceData.duration_seconds.toString());
        params.append('witness', invoiceData.witness.toString());
        if (invoiceData.blind !== undefined) {
            params.append('blind', invoiceData.blind.toString());
        }

        const confirmUrl = browser.runtime.getURL(`/popup.html#/confirm-invoice-generation?${params.toString()}`);
        
        const popup = await browser.windows.create({
            url: confirmUrl,
            type: 'popup',
            width: 420,
            height: 600,
        });

        return new Promise<any>((resolve, reject) => {
            const handler = (msg: any) => {
                if (msg.type === 'invoice-generation-response') {
                    browser.runtime.onMessage.removeListener(handler);
                    if (msg.success) {
                        resolve(msg.result);
                    } else {
                        reject(new WalletError(msg.error || 'Invoice generation cancelled'));
                    }
                }
            };
            browser.runtime.onMessage.addListener(handler);
        });
    }
}

export const walletService = new WalletService();

