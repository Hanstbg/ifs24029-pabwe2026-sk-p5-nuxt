import tailwindcss from "@tailwindcss/vite";
import { deferNuxtCss } from "./server/utils/deferCss";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  telemetry: false,
  // SPA mode (client-side routing & localStorage)
  ssr: false,
  // Nuxt membaca source dari src/
  srcDir: "src/",
  // Aktifkan vue-router; rute disediakan oleh src/router.options.ts
  pages: true,
  css: ["~/index.css"],
  modules: ["@pinia/nuxt"],
  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"),
    },
  },
  devServer: { port: customPort },
  // HTML tidak boleh "no-store" agar halaman bisa dipulihkan dari back/forward cache (bfcache).
  routeRules: {
    "/": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/auth/**": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/cash-flows/**": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/profile": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/users": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/_nuxt/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
  },
  nitro: {
    devPort: customPort,
    hooks: {
      // Untuk HTML yang di-prerender saat build (200.html / index.html)
      "prerender:generate"(route) {
        if (typeof route.contents === "string" && route.fileName?.endsWith(".html")) {
          route.contents = deferNuxtCss(route.contents);
        }
      },
    },
    // Paksa runtime Nuxt digabung (inline) ke build server, agar modul virtual
    // nuxt/internal/* (manifest & precomputed) terisi walau path project berspasi di Windows.
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/, /[\\/]node_modules[\\/]@nuxt[\\/]/, "nuxt/dist", "@nuxt/"],
    },
  },
  app: {
    head: {
      title: "Delcom Cash Flow",
      htmlAttrs: { lang: "id" },
      meta: [
        {
          name: "description",
          content:
            "Delcom Cash Flow: aplikasi pencatat arus kas pribadi untuk memantau pemasukan, pengeluaran, tabungan, dan pinjaman.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        // Font dimuat non-blocking: media=print lalu diaktifkan setelah terunduh
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap",
          media: "print",
          onload: "this.media='all'",
        },
      ],
      noscript: [
        {
          innerHTML:
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap">',
        },
      ],
      // CSS kritis minimal agar tidak ada flash putih sebelum stylesheet utama aktif
      style: [{ innerHTML: "body{background-color:#f8fafc;color:#0f172a}" }],
      bodyAttrs: { class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen" },
    },
  },
});