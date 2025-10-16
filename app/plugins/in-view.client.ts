export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('in-view', {
    mounted(el: HTMLElement) {
      const cls = 'is-visible'
      const obs = new IntersectionObserver(
        (entries, o) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.classList.add(cls)
              o.unobserve(el)
            }
          })
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
      )
      ;(el as any).__inViewObserver = obs
      obs.observe(el)
    },
    unmounted(el: HTMLElement) {
      const obs = (el as any).__inViewObserver as IntersectionObserver | undefined
      if (obs) {
        try { obs.unobserve(el) } catch {}
        ;(el as any).__inViewObserver = undefined
      }
    }
  })
})
