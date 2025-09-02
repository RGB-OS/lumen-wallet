import {RGBWebLNProvider} from 'rgb-webln-sdk';

declare global {
  interface Window {
    rgbwebln?: RGBWebLNProvider;
  }
}

export default defineUnlistedScript(() => {
    console.log("Hello from injected.ts");
    let idCounter = 0;
  
    async function callWebLN(method: string, params?: any): Promise<any> {
  
      return new Promise((resolve, reject) => {
        const id = ++idCounter;
        console.log(`Calling WebLN method: ${method}`, { id, params });
        window.postMessage({ id, webln: { method, params } }, '*');
  
        const handler = (event: MessageEvent) => {
          const res = event.data.weblnResponse;
          if (res?.id !== id) return;
          window.removeEventListener('message', handler);
          console.log(res)
          if (res.error) {
            const { message, type, code } = res.error;
            const errorMessage = message || 'Unknown error';
            const err = new Error(typeof errorMessage === 'string' ? errorMessage : 'Unknown error');
            (err as any).type = type || 'UnknownError';
            (err as any).code = code || 'UNSPECIFIED';
            reject(err);
          } else {
            resolve(res.result);
          }
        };
  
        window.addEventListener('message', handler);
      });
    }
  
    window.rgbwebln = {
      enable: () => callWebLN('enable'),
      isEnabled: () => callWebLN('isEnabled'),
      getInfo: () => callWebLN('getInfo'),
      getBalance: () => callWebLN('getBalance'),
      getAddress: () =>  callWebLN('request', { method:'address' }),
      rgbInvoice:(params)=> {
        // Ensure params is an object and provide defaults
        const safeParams = params || {};
        return callWebLN('request', { method: 'rgbinvoice', params: safeParams });
      },
      decodeRgbInvoice: (params) => callWebLN('request', { method: 'decodergbinvoice', params }),
      sendAsset: (params) => callWebLN('request', { method: 'sendasset', params }),
      listTransfers: (params) => callWebLN('request', { method: 'listtransfers', params }),
      listAssets: () => callWebLN('request', { method: 'listassets' }),
      getNetworkInfo: () => callWebLN('request', { method: 'getNetworkInfo' }),
      signMessage: (message: string) => callWebLN('request', { method: 'signmessage', params: { message } }),
      on: (event: string, callback: (data: any) => void) => {
        console.log(`WebLN event listener for: ${event} not implemented`);
      },
      off: (event: string, callback: (data: any) => void) => {
        console.log(`WebLN event listener off for: ${event} not implemented`);
      },
      // makeInvoice: (args: { amount: number }) => callWebLN('makeInvoice', args),
      // sendPayment: (invoice: string) => callWebLN('sendPayment', { invoice }),
      // keysend: (dest: string, amount: number) => callWebLN('keysend', { dest, amount }),
      request: (method: string, params: any) => callWebLN('request', { method, params }),
    };
    
  });
