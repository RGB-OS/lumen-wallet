import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    action: {
      default_title: 'Lumen',
    },
    permissions: ['storage', 'activeTab'],
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
  modules: ['@wxt-dev/module-react','@wxt-dev/auto-icons'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  
});
