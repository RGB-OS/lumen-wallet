import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['storage'],
    web_accessible_resources: [
      {
        resources: ["injected.js"],
        matches: ["*://*/*"],
      },
    ],
  },
  webExt: {
    startUrls: ["https://wxt.dev"],
  },
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  
});
