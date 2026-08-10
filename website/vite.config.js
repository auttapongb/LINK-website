import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        howItWorks: resolve(__dirname, "how-it-works.html"),
        earnToBurn: resolve(__dirname, "earn-to-burn.html"),
        forFamilies: resolve(__dirname, "for-families.html"),
        useCases: resolve(__dirname, "use-cases.html"),
        partners: resolve(__dirname, "partners.html"),
        privacy: resolve(__dirname, "privacy.html"),
        faq: resolve(__dirname, "faq.html"),
        sitemap: resolve(__dirname, "sitemap.html"),
        demo: resolve(__dirname, "demo.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
