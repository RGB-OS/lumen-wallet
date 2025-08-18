
declare global {
  interface Window {
    webln?: any;
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
            const err = new Error(message || 'Unknown error');
            (err as any).type = type;
            (err as any).code = code;
            reject(err);
          } else {
            resolve(res.result);
          }
        };
  
        window.addEventListener('message', handler);
      });
    }
  
    window.webln = {
      enable: () => callWebLN('enable'),
      isEnabled: () => callWebLN('isEnabled'),
      getInfo: () => callWebLN('getInfo'),
      getBalance: () => callWebLN('getBalance'),
      makeInvoice: (args: { amount: number }) => callWebLN('makeInvoice', args),
      sendPayment: (invoice: string) => callWebLN('sendPayment', { invoice }),
      keysend: (dest: string, amount: number) => callWebLN('keysend', { dest, amount }),
      request: (method: string, params: any) => callWebLN('request', { method, params }),
    };
    
  });
