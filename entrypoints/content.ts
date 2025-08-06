export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log("Injecting script...");
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    // browser.runtime.onMessage.addListener((message, _, sendResponse) => {
    //   console.log("Content script received message:", message);
    //   sendResponse(Math.random());
    //   return true;
    // });
    window.addEventListener('message', (event) => {
      console.log("Content script received message:", event.data);
      if (!event.data?.webln) return;
    
      const request = event.data.webln;
    
      browser.runtime.sendMessage(
        { webln: request },
        (response) => {
          window.postMessage(
            {
              weblnResponse: {
                id: request.id,
                ...response,
              },
            },
            '*'
          );
        }
      );
    });
    console.log("Done!");
  },
});