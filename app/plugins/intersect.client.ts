
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('intersect', {
    mounted(el: HTMLElement, binding) {
      const cb: (() => void) | undefined = typeof binding.value === 'function' ? binding.value : undefined
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              cb && cb()
            }
          })
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
      )
      ;(el as any).__io = obs
      obs.observe(el)
    },
    unmounted(el: HTMLElement) {
      const obs = (el as any).__io as IntersectionObserver | undefined
      if (obs) {
        try { obs.unobserve(el) } catch {}
        ;(el as any).__io = undefined
      }
    }
  })
})