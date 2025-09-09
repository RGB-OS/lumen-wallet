import { nodeService } from "@/services/nodeService";
import { walletService } from "@/services/walletService";
import { authService } from "@/services/authService";
import { WalletMethodNotFound } from "@/utils/wallet-errors";

export default defineBackground(() => {
  // Handle WebLN requests
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("defineBackground: ",msg)
    if (msg.webln) {
      (async () => {
        const origin = sender.origin || new URL(sender.url || '').origin;
        try {
          switch (msg.webln.method) {
            case 'enable':
              const res = await walletService.enable(origin);
              console.log("enabele reeeesss")
              return sendResponse({ result: res });
            case 'isEnabled':
              const enabled = await walletService.isEnabled(origin);
              return sendResponse({ result: enabled });
            case 'getInfo':
              return sendResponse({ result: await walletService.getInfo(origin) });
            case 'getBalance':
              return sendResponse({ result: await walletService.getBalance(origin) });
            case 'request': {
              const { method, params } = msg.webln.params;
              const result = await walletService.handleCustomRequest(origin, method, params);
              return sendResponse({ result });
            }
            default:
             throw new WalletMethodNotFound(msg.webln.method);
          }
        } catch (err: any) {
          return sendResponse({
            error: {
              message: err.message ?? 'Unknown error',
              type: err.name ?? 'UnknownError',
              code: err.code ?? 'UNSPECIFIED',
            },
          });
        }
      })();

      return true; // Required to keep the message channel open
    }
  });
});
