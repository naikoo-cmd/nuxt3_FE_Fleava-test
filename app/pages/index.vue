<script setup lang="ts">
import { computed, ref } from 'vue'
import MovieSlideshow from '../components/MovieSlideshow.vue'
import MovieGrid from '../components/MovieGrid.vue'

// Switch to paginated composable
const {
  category, setCategory,
  slides, movies, loading, error,
  page, pageSize, totalPages, goToPage, pagesWindow
} = useTMDBPagination()

const heroBg = ref<string>('')

const tagline = computed(() => {
  switch (category.value) {
    case 'top_rated': return 'Critically acclaimed hits loved by audiences worldwide.'
    case 'upcoming':  return 'Discover movies that are coming soon to theaters.'
    default:          return 'See what everyone’s watching right now.'
  }
})
</script>

<style lang="scss" src="@/layout/styles/HomePage.scss"></style>
<style scoped>
.pager {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr auto;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem);
}
.pager__pages {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center; /* centered on all screens */
}
.pager__btn {
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--text);
  border-radius: 12px;
  padding: 0.45rem 0.8rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 120ms ease,
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease;
}
.pager__btn:hover { transform: translateY(-1px); background: var(--surface-2); }
.pager__btn.is-active {
  background: var(--accent);
  color: var(--accent-contrast);
  border-color: var(--accent);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--accent) 35%, transparent);
}
.pager__btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pager__size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
  font-weight: 700;
}
.pager__select {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 10px;
  padding: 0.35rem 0.5rem;
  font-weight: 700;
}
@media (max-width: 640px) {
  .pager { grid-template-columns: 1fr; justify-items: center; }
}
</style>

<template>
  <div>
    <Header />

    <main class="home">
      <section class="home__hero">
        <div class="home__hero-bg-wrap" aria-hidden="true">
          <transition name="bg-fade" mode="out-in">
            <div v-if="heroBg" :key="heroBg" class="home__hero-bg" :style="{ backgroundImage: `url(${heroBg})` }" />
          </transition>
        </div>
        <MovieSlideshow :slides="slides" @change="heroBg = $event" />
      </section>

      <!-- RE-ADDED: Category buttons -->
      <section class="home__category-bar">
        <button class="btn" :class="{ 'btn--active': category === 'popular' }" @click="setCategory('popular')">Popular</button>
        <button class="btn" :class="{ 'btn--active': category === 'top_rated' }" @click="setCategory('top_rated')">Top Rated</button>
        <button class="btn" :class="{ 'btn--active': category === 'upcoming' }" @click="setCategory('upcoming')">Upcoming</button>
      </section>

      <!-- Lazy hydrate komponen grid saat terlihat di viewport -->
      <section class="home__content">
        <MovieGrid hydrate-on-visible="{ rootMargin: '200px' }" :movies="movies" :loading="loading" />
        <p v-if="!loading && !movies.length && !error" class="muted">No movies available.</p>
        <p v-if="error" class="muted">Failed to load movies. Please try again.</p>
      </section>

      <!-- Pager tetap on-demand; data diambil per halaman -->
      <nav class="pager" aria-label="Pagination">
        <div class="pager__pages">
          <button class="pager__btn" :disabled="page === 1" @click="goToPage(page - 1)">Prev</button>
          <button
            v-for="p in pagesWindow"
            :key="`p-${p}`"
            class="pager__btn"
            :class="{ 'is-active': p === page }"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
          <button class="pager__btn" :disabled="page === totalPages" @click="goToPage(page + 1)">Next</button>
          <span class="pager__btn" v-if="pagesWindow[0] !== 1">…</span>
        </div>
        <label class="pager__size">
          Per page:
          <select class="pager__select" v-model.number="pageSize">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="30">30</option>
          </select>
        </label>
      </nav>
    </main>
  </div>
</template>