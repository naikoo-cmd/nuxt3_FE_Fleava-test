// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  runtimeConfig: {
    // server-side secret fallback (keberadaan TMDB_API_KEY masih didukung)
    tmdbApiKey: process.env.TMDB_API_KEY ?? process.env.NUXT_PUBLIC_TMDB_API_KEY,
    tmdbBaseUrl: process.env.TMDB_BASE_URL ?? process.env.NUXT_PUBLIC_TMDB_BASE_URL ?? 'https://api.themoviedb.org/3',
    public: {
      // frontend needs image base and (optionally) a public API key
      tmdbImageBase: process.env.NUXT_PUBLIC_TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p',
      tmdbApiKey: process.env.NUXT_PUBLIC_TMDB_API_KEY ?? null,
      tmdbBaseUrl: process.env.NUXT_PUBLIC_TMDB_BASE_URL ?? null
    }
  },
  // Disable type checking plugin in Vite to avoid child connection attempts
  typescript: { typeCheck: false },
  compatibilityDate: '2025-07-15',
  // Turn off Nuxt DevTools to avoid vite-plugin-vue-tracer and related sockets
  devtools: { enabled: false }
})
