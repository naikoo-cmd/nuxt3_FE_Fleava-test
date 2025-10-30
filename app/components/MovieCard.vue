<template>
  <article class="movie" v-in-view>
    <NuxtLink :to="`/movies/${movie.id}`" class="movie__poster">
      <div v-if="isLoading" class="skeleton skeleton--card shimmer" aria-hidden="true" />
      <picture v-else>
        <img :src="imgSrc" :srcset="movie.posterSet" sizes="(max-width: 600px) 50vw, (max-width: 1200px) 25vw, 16vw"
          :alt="movie.title" loading="lazy" decoding="async" @error="onError" />
      </picture>
      <div class="movie__rating" v-if="movie.rating !== undefined">
        ★ {{ Number(movie.rating).toFixed(1) }}
      </div>
    </NuxtLink>
    <NuxtLink :to="`/movies/${movie.id}`" class="movie__title">{{ movie.title }}</NuxtLink>
    <p class="movie__meta" v-if="movie.year">{{ movie.year }}</p>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ movie: any }>()
// Use an inline SVG data-URI as the fallback to avoid external requests that can 404
const FALLBACK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900" role="img" aria-label="Poster fallback">
  <rect width="100%" height="100%" fill="#111"/>
  <g fill="#222">
    <rect x="20" y="20" width="560" height="860" rx="12" />
  </g>
  <text x="50%" y="50%" fill="#666" font-family="Inter, Arial, sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">
    Poster unavailable
  </text>
</svg>`
const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(FALLBACK_SVG)}`
const imgSrc = ref(props.movie.poster || fallback)
const isLoading = ref(true)

function onError() {
  imgSrc.value = fallback
}

onMounted(() => {
  // Preload to drive skeleton removal reliably
  const test = new Image()
  test.src = imgSrc.value
  test.onload = () => { isLoading.value = false }
  test.onerror = () => { imgSrc.value = fallback; isLoading.value = false }
})
</script>

<style lang="scss" src="@/layout/styles/PopularMovies.scss"></style>
<style scoped>
.skeleton {
  width: 100%;
  height: 100%;
  display: block;
}
</style>