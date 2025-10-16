// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  runtimeConfig: {
    tmdbApiKey: process.env.TMDB_API_KEY,
    tmdbBaseUrl: 'https://api.themoviedb.org/3',
    public: {
      tmdbImageBase: 'https://image.tmdb.org/t/p'
    }
  },
  // Disable type checking plugin in Vite to avoid child connection attempts
  typescript: {
    typeCheck: false
  },
  compatibilityDate: '2025-07-15',
  // Turn off Nuxt DevTools to avoid vite-plugin-vue-tracer and related sockets
  devtools: { enabled: false }
})
