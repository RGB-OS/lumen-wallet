export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log("Injecting script...");
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    window.addEventListener('message', (event) => {
      console.log("Content script received message:", event.data);
      const { id, webln } = event.data;
      if (!webln) return;

      browser.runtime.sendMessage(
        { webln },
        (response) => {
          window.postMessage(
            {
              weblnResponse: {
                id,
                ...response,
              },
            },
            '*'
          );
        }
      );
    });
  },
});