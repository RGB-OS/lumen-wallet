import { nodeService } from "@/services/nodeService";
import { walletService } from "@/services/walletService";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    const origin = sender.origin || new URL(sender.url || '').origin;
  
    console.log('Received message:', msg, 'from origin:', origin);
    try {
      switch (msg.method) {
        case 'enable':
          const res = await walletService.enable(origin);
          return sendResponse({ result: res });
        case 'getInfo':
          return sendResponse({ result: await walletService.getInfo(origin) });
        case 'getBalance':
          return sendResponse({ result: await walletService.getBalance(origin) });
        // case 'makeInvoice':
        //   return sendResponse({ result: await nodeService.makeInvoice(msg.params.amount) });
        // case 'sendPayment':
        //   return sendResponse({ result: await nodeService.sendPayment(msg.params.invoice) });
        // case 'keysend':
        //   return sendResponse({ result: await nodeService.keysend(msg.params.dest, msg.params.amount) });
        default:
          return sendResponse({ error: 'Unknown method' });
      }
    } catch (err: any) {
      return sendResponse({ error: err.message });
    }
  });
});
