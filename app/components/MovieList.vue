<template>
  <div class="movies">
    <article
      v-for="m in movies"
      :key="m.id"
      class="movie"
      v-in-view
    >
      <div class="movie__poster">
        <img :src="m.poster" :alt="m.title" loading="lazy" decoding="async" />
        <div class="movie__rating" v-if="m.rating !== undefined">
          ★ {{ m.rating.toFixed(1) }}
        </div>
      </div>
      <h3 class="movie__title">{{ m.title }}</h3>
      <p class="movie__meta" v-if="m.year">{{ m.year }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
interface Movie {
  id: string | number
  title: string
  poster: string
  year?: number | string
  rating?: number
}
defineProps<{ movies: Movie[] }>()

// Simple v-in-view directive
const vInView = {
  mounted(el: HTMLElement) {
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
            o.unobserve(el)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    )
    obs.observe(el)
  }
}
</script>

<style lang="scss" src="@/layout/styles/PopularMovies.scss"></style>