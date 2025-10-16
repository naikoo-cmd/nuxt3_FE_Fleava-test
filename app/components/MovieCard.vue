<template>
  <article class="movie" v-in-view>
    <NuxtLink :to="`/movies/${movie.id}`" class="movie__poster">
      <div v-if="isLoading" class="skeleton skeleton--card shimmer" aria-hidden="true" />
      <picture v-else>
        <img
          :src="imgSrc"
          :srcset="movie.posterSet"
          sizes="(max-width: 600px) 50vw, (max-width: 1200px) 25vw, 16vw"
          :alt="movie.title"
          loading="lazy"
          decoding="async"
          @error="onError"
        />
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
const fallback = '/poster-fallback.svg'
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
.skeleton { width: 100%; height: 100%; display: block; }
</style>