
declare global {
  interface Window {
    webln?: any;
  }
}

export default defineUnlistedScript(() => {
    console.log("Hello from injected.ts");
    let idCounter = 0;
    let isEnabled = false;
  
    async function callWebLN(method: string, params?: any): Promise<any> {
      if (!isEnabled && method !== 'enable') {
        throw new Error('webln.enable() must be called first');
      }
  
      return new Promise((resolve, reject) => {
        const id = ++idCounter;
        console.log(`Calling WebLN method: ${method}`, { id, params });
        window.postMessage({ id, webln: { method, params } }, '*');
  
        const handler = (event: MessageEvent) => {
          const res = event.data.weblnResponse;
          if (res?.id !== id) return;
          window.removeEventListener('message', handler);
          res.error ? reject(new Error(res.error)) : resolve(res.result);
        };
  
        window.addEventListener('message', handler);
      });
    }
  
    window.webln = {
      enable: async () => {
        const res = await callWebLN('enable');
        isEnabled = true;
        return res;
      },
      getInfo: () => callWebLN('getInfo'),
      getBalance: () => callWebLN('getBalance'),
      makeInvoice: (args: { amount: number }) => callWebLN('makeInvoice', args),
      sendPayment: (invoice: string) => callWebLN('sendPayment', { invoice }),
      keysend: (dest: string, amount: number) => callWebLN('keysend', { dest, amount }),
    };
    
  });
