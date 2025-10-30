// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "app",
  runtimeConfig: {
    tmdbApiKey:
      process.env.TMDB_API_KEY ?? process.env.NUXT_PUBLIC_TMDB_API_KEY,
    tmdbBaseUrl:
      process.env.TMDB_BASE_URL ??
      process.env.NUXT_PUBLIC_TMDB_BASE_URL ??
      "https://api.themoviedb.org/3",
    public: {
      tmdbImageBase:
        process.env.NUXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p",
      tmdbApiKey: process.env.NUXT_PUBLIC_TMDB_API_KEY ?? undefined,
      tmdbBaseUrl: process.env.NUXT_PUBLIC_TMDB_BASE_URL ?? undefined,
    },
  },

  typescript: { typeCheck: false },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  app: {
    head: {
      title: "TMBD Nuxt3 Demo",
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
});
