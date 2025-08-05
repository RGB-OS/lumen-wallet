
declare global {
  interface Window {
    webln?: any;
  }
}

export default defineUnlistedScript(() => {
    console.log("Hello from injected.ts");
   
    window.webln = {
      enable: async () => {
        const approved = confirm('Allow this site to connect to your RGB wallet?');
        if (!approved) throw new Error('User denied access');
        return window.webln;
      },
    
      getInfo: async () => {
        return {
          node: 'RGBNode',
          pubkey: 'your-pubkey-here',
          methods: ['sendPayment', 'signMessage'],
        };
      },
    
      sendPayment: async (paymentRequest: string) => {
        const response = await new Promise((resolve) => {
          const handler = (event: MessageEvent) => {
            if (event.data?.type === 'WEBLN_SEND_PAYMENT_RESULT') {
              window.removeEventListener('message', handler);
              resolve(event.data.result);
            }
          };
          window.addEventListener('message', handler);
    
          window.postMessage(
            {
              type: 'WEBLN_SEND_PAYMENT',
              paymentRequest,
            },
            '*',
          );
        });
    
        return response;
      },
    };
    
  });
