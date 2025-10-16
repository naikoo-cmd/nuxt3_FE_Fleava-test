export default defineNuxtPlugin((nuxtApp) => {
  // No-op SSR directives so the server renderer can resolve them safely.
  // On the client, the real behaviors are provided by *.client.ts plugins.
  nuxtApp.vueApp.directive('intersect', {})
  nuxtApp.vueApp.directive('in-view', {})
})
