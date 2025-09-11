export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    await injectScript("/injected.js", {
      keepInDom: true,
    });
    window.addEventListener('message', (event) => {
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