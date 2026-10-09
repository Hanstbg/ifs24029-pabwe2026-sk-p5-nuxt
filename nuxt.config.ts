import tailwindcss from "@tailwindcss/vite";

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
  nitro: {
    devPort: customPort,
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
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
        },
      ],
      bodyAttrs: { class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen" },
    },
  },
});