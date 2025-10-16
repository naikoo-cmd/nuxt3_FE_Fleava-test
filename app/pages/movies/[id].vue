<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Use same route transition name as global for consistency
definePageMeta({
  pageTransition: { name: 'route-fade', mode: 'out-in' }
})

const route = useRoute()
const id = computed(() => route.params.id)

const { data, pending, error, refresh } = useFetch(`/api/tmdb/movie/${id.value}`, {
  key: () => `tmdb-movie-${id.value}`,
  server: true
})

const d = computed(() => data.value as any || {})
const hasTrailer = computed(() => !!d.value?.trailer?.url)

// 1) Dynamic tab title
useHead(() => ({
  title: d.value?.title ? `${d.value.title} • Nuxt Movies` : 'Movie Details • Nuxt Movies'
}))

// 3) Trailer popup state + embed URL
const showTrailer = ref(false)
const trailerEmbed = computed(() => {
  const t = d.value?.trailer
  // Prefer YouTube embed with autoplay; fallback to raw URL if not YT
  if (t?.site === 'YouTube' && t?.key) {
    return `https://www.youtube.com/embed/${t.key}?autoplay=1&rel=0`
  }
  return t?.url || ''
})
function openTrailer() { if (hasTrailer.value) showTrailer.value = true }
function closeTrailer() { showTrailer.value = false }

// Lock page scroll when modal is open
watch(showTrailer, (open) => {
  const root = document.documentElement
  const body = document.body
  if (open) { root.classList.add('modal-open'); body.classList.add('modal-open') }
  else { root.classList.remove('modal-open'); body.classList.remove('modal-open') }
})
onBeforeUnmount(() => {
  document.documentElement.classList.remove('modal-open')
  document.body.classList.remove('modal-open')
})

// 4) Back button
const router = useRouter()
function goBack() { router.back() }
</script>

<template>
  <div class="movie-page">
    <Header />

    <main class="movie-detail">
      <!-- HAPUS tombol back lama di sini -->
      <!-- <button class="back-btn" @click="goBack" aria-label="Go back">← Back</button> -->

      <section class="movie-detail__hero" v-if="!pending && !error">
        <div class="movie-detail__bg" :style="{ backgroundImage: d.backdrop ? `url(${d.backdrop})` : '' }" />
        <div class="movie-detail__inner">
          <!-- LEFT COLUMN: poster + cast -->
          <div class="movie-detail__left">
            <!-- Wrapper relatif untuk overlay tombol -->
            <div class="movie-detail__poster-wrap">
              <button class="back-btn back-btn--poster" @click="goBack" aria-label="Go back">← Back</button>
              <img v-if="d.poster" :src="d.poster" :alt="d.title" class="movie-detail__poster" loading="lazy" decoding="async" />
            </div>

            <div class="movie-detail__panel movie-detail__panel--cast-inline">
              <h2>Top Billed Cast</h2>
              <ul class="cast">
                <li v-for="c in d.cast" :key="c.id" class="cast__item">
                  <img v-if="c.profile" :src="c.profile" :alt="c.name" loading="lazy" decoding="async" />
                  <div class="cast__meta">
                    <strong>{{ c.name }}</strong>
                    <span v-if="c.character">{{ c.character }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- RIGHT COLUMN: info -->
          <div class="movie-detail__meta">
            <h1 class="movie-detail__title">{{ d.title }}</h1>
            <p v-if="d.original_title && d.original_title !== d.title" class="movie-detail__original">Original: {{ d.original_title }}</p>
            <p v-if="d.genres?.length" class="movie-detail__genres">{{ d.genres.join(' • ') }}</p>
            <p v-if="d.overview" class="movie-detail__overview">{{ d.overview }}</p>

            <div class="movie-detail__actions">
              <button v-if="hasTrailer" class="btn btn--accent" @click="openTrailer">Play Trailer</button>
              <a v-if="d.external?.imdb" :href="d.external.imdb" target="_blank" rel="noopener" class="btn">IMDb</a>
              <a v-if="d.external?.twitter" :href="d.external.twitter" target="_blank" rel="noopener" class="btn">Twitter</a>
              <a v-if="d.external?.instagram" :href="d.external.instagram" target="_blank" rel="noopener" class="btn">Instagram</a>
              <a v-if="d.external?.facebook" :href="d.external.facebook" target="_blank" rel="noopener" class="btn">Facebook</a>
            </div>

            <div class="movie-detail__panel movie-detail__panel--details">
              <h2>Details</h2>
              <ul class="facts">
                <li v-if="d.director"><strong>Director:</strong> {{ d.director.name }}</li>
                <li v-if="d.status"><strong>Status:</strong> {{ d.status }}</li>
                <li v-if="d.spoken_languages?.length"><strong>Languages:</strong> {{ d.spoken_languages.join(', ') }}</li>
                <li v-if="d.release_date"><strong>Release Date:</strong> {{ d.release_date }}</li>
                <li v-if="d.runtime"><strong>Runtime:</strong> {{ d.runtime }} min</li>
                <li><strong>Budget:</strong> {{ new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(d.budget || 0) }}</li>
                <li><strong>Revenue:</strong> {{ new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(d.revenue || 0) }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section v-if="pending" class="movie-detail__loading">
        <div class="skeleton skeleton--banner shimmer" />
        <div class="skeleton skeleton--text shimmer" />
        <div class="skeleton skeleton--text shimmer" />
      </section>

      <section v-if="error" class="movie-detail__error">
        <p>Failed to load movie. <button class="btn" @click="() => refresh()">Retry</button></p>
      </section>

      <!-- 3) Trailer Popup: teleport to Nuxt teleports root to avoid parent stacking/overflow -->
      <Teleport to="#teleports">
        <Transition name="modal">
          <div v-if="showTrailer" class="modal" role="dialog" aria-modal="true" aria-label="Trailer">
            <div class="modal__backdrop" @click="closeTrailer"></div>
            <div class="modal__dialog" role="document">
              <button class="modal__close" @click="closeTrailer" aria-label="Close">✕</button>
              <div class="modal__frame">
                <iframe
                  v-if="trailerEmbed"
                  class="modal__iframe"
                  :src="trailerEmbed"
                  title="Trailer"
                  frameborder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowfullscreen
                />
                <p v-else class="modal__fallback">Trailer unavailable.</p>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>
  </div>
</template>

<style scoped>
/* 2) Responsive poster/info layout */
.movie-detail {
  display: grid;
  gap: clamp(1rem, 2vw, 2rem);
  padding-bottom: clamp(1rem, 4vh, 2rem);
}
.movie-detail__hero { position: relative; isolation: isolate; }
.movie-detail__bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  filter: blur(30px) saturate(1.05);
  transform: scale(1.05);
  opacity: 0.55;
  z-index: 0;
}
.movie-detail__inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin-inline: auto;
  padding: clamp(1rem, 3vw, 2rem);
  display: grid;
  grid-template-columns: clamp(180px, 24vw, 320px) 1fr;
  gap: clamp(0.75rem, 2vw, 1.25rem); /* lebih dekat agar cast mendekati poster */
  align-items: start;
}
.movie-detail__poster {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 12px;
  box-shadow: 0 8px 26px rgba(0,0,0,0.35);
  background: var(--surface);
}
.movie-detail__meta { display: grid; gap: 0.5rem; }
.movie-detail__title {
  margin: 0;
  font-size: clamp(1.6rem, 1.2vw + 1.4rem, 2.4rem);
  font-weight: 900;
  letter-spacing: 0.2px;
}
.movie-detail__original { color: var(--muted); margin: 0; }
.movie-detail__genres { color: var(--muted); margin: 0; }
.movie-detail__overview { margin: 0.25rem 0 0; color: var(--text); line-height: 1.6; }

.movie-detail__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
.btn {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  font-weight: 800;
  transition: transform 120ms ease, background 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
}
.btn:hover { transform: translateY(-1px); background: var(--surface-2); }
.btn--accent {
  background: var(--accent); color: var(--accent-contrast); border-color: var(--accent);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--accent) 35%, transparent);
}

/* Details panel spacing when placed under actions */
.movie-detail__panel--details {
  margin-top: clamp(0.75rem, 2vh, 1rem);
}

/* NEW: Cast inline (desktop) styling */
.movie-detail__panel--cast-inline {
  display: block; /* selalu tampil (horizontal + wrap) */
}

/* Grid below hero now only holds Cast; single column */
.movie-detail__grid {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 2rem);
  display: grid;
  grid-template-columns: 1fr; /* was: 2fr 1fr */
  gap: clamp(1rem, 2.5vw, 2rem);
  margin-top: clamp(0.75rem, 2vh, 1rem);
}

/* Mobile grid (below hero) remains for small screens; hidden on desktop */
.movie-detail__grid--cast {
  display: none !important; /* sembunyikan jika masih ada di template */
}

/* Back button: compact, tidak full width */
.back-btn {
  /* pastikan tidak melebar */
  display: inline-flex;            /* compact by content */
  width: auto !important;          /* override kemungkinan aturan global */
  max-width: max-content;
  white-space: nowrap;
  align-items: center;
  gap: 0.35rem;

  position: sticky;
  top: 0.75rem;
  /* remove left offset that can increase scrollable width */
  /* left: clamp(1rem, 3vw, 2rem); */ /* removed */
  margin-left: clamp(1rem, 3vw, 2rem); /* keep spacing via margin only */
  margin-top: 0.5rem;

  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-weight: 800;
  transition: background 180ms ease, transform 120ms ease, border-color 180ms ease;
}
.back-btn:hover { transform: translateY(-1px); background: var(--surface-2); }

/* Poster wrap agar tombol bisa di-overlay */
.movie-detail__poster-wrap {
  position: relative;
  display: inline-block; /* ukuran wrap mengikuti poster */
  width: 100%;
}

/* Back button di luar poster di kiri-atas poster */
.back-btn--poster {
  position: relative;
  top: 5;
  left: 0;

  /* geser ke atas sedikit agar di luar area poster, tetap sejajar kiri */
  transform: translateY(calc(-100% - 8px));

  z-index: 2;
  display: inline-flex;
  width: auto !important;
  max-width: max-content;
  margin: 0;                
  white-space: nowrap;
  align-items: center;
  gap: 0.35rem;

  background: color-mix(in srgb, var(--surface) 85%, transparent);
  backdrop-filter: blur(4px);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-weight: 800;
  transition: background 180ms ease, transform 120ms ease, border-color 180ms ease;
}
.back-btn--poster:hover { transform: translateY(calc(-100% - 8px)) translateY(-1px); }

/* Jaga agar tidak ter-clip dan tidak menambah horizontal scroll */
.movie-detail__left { position: relative; min-width: 0; }
.movie-detail__hero { overflow: clip; } /* tetap clip blur bg; padding hero menjaga tombol tidak terpotong */

/* Cast: tambah jarak horizontal, ukuran kartu konsisten */
.cast {
  /* kontrol global spacing & ukuran */
  --cast-gap: clamp(0.75rem, 2vw, 1rem);       /* lebih lega horisontal */
  --cast-card-w: clamp(180px, 22vw, 240px);
  --cast-thumb: 56px;

  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, auto);
  grid-auto-columns: var(--cast-card-w);

  /* jarak horizontal lebih besar dari vertikal */
  column-gap: calc(var(--cast-gap) + 0.5rem);
  row-gap: var(--cast-gap);

  /* beri in-set supaya item pinggir tidak menempel tepi */
  padding-inline: clamp(0.5rem, 1.5vw, 1rem);
  align-items: start;
  overflow: visible;
}

.cast__item {
  /* ukuran konsisten */
  width: var(--cast-card-w);
  min-width: var(--cast-card-w);
  max-width: var(--cast-card-w);

  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.8rem;

  background: var(--surface-2);
  border: 1px solid color-mix(in srgb, var(--border) 100%, transparent);
  border-radius: 10px;
  transition: background 160ms ease, transform 120ms ease, box-shadow 160ms ease, border-color 160ms ease;
}
.cast__item:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--surface-2) 90%, var(--surface));
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
}

.cast__item img {
  width: var(--cast-thumb);
  height: var(--cast-thumb);
  flex: 0 0 var(--cast-thumb);
  border-radius: 8px;
  object-fit: cover;
  background: var(--surface);
}

.cast__meta {
  display: grid;
  gap: 2px;
  min-width: 0; /* enables ellipsis */
}
.cast__meta strong {
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cast__meta span {
  color: var(--muted);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
} 

/* Mobile: tetap rapi, scroll horizontal lembut jika perlu */
@media (max-width: 900px) {
  .movie-detail__inner { grid-template-columns: 1fr; }
  .movie-detail__poster { max-width: 320px; }

  .cast {
    grid-template-rows: auto;
    grid-auto-flow: column;
    grid-auto-columns: clamp(170px, 66vw, 220px);
    column-gap: calc(var(--cast-gap) + 0.5rem);
    row-gap: 0;
    padding-inline: clamp(0.5rem, 4vw, 1rem);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    padding-bottom: 0.25rem;
  }
  .cast__item { scroll-snap-align: start; }
}

/* Desktop besar: boleh sedikit lebih lebar */
@media (min-width: 1280px) {
  .cast { --cast-card-w: 260px; }
}
</style>

<style>
/* Page transition (global) */
.route-fade-enter-active, .route-fade-leave-active { transition: opacity 300ms ease; }
.route-fade-enter-from, .route-fade-leave-to { opacity: 0; }

/* Global modal styles to ensure overlay above header and wrappers */
.modal {
  position: fixed !important;
  inset: 0 !important;
  z-index: 9999 !important; /* above .site-header (z:50) */
  display: grid !important;
  place-items: center !important;
  pointer-events: auto !important;
}
.modal-enter-active, .modal-leave-active { transition: opacity 260ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.modal__backdrop {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(2px);
}

.modal__dialog {
  position: relative;
  width: min(96vw, 980px);
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  transform: scale(0.985);
  animation: modal-zoom 220ms ease forwards;
  background: #000;
}
@keyframes modal-zoom { from { transform: scale(0.985) } to { transform: scale(1) } }

.modal__close {
  position: absolute; top: 8px; right: 8px; z-index: 2;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  color: var(--text);
  border-radius: 999px;
  width: 36px; height: 36px;
  display: grid; place-items: center;
  font-size: 18px; line-height: 1;
  cursor: pointer;
  transition: background 180ms ease, transform 120ms ease, border-color 180ms ease;
}
.modal__close:hover { transform: scale(1.05); background: var(--surface-2); }

.modal__frame, .modal__iframe { width: 100%; height: 100%; display: block; background: #000; }

/* Prevent background scroll while modal is open */
html.modal-open, body.modal-open { overflow: hidden !important; }
</style>

<style scoped>
/* Sembunyikan scrollbar untuk halaman ini, tetap bisa scroll */
.movie-page {
  min-height: 100dvh;
  max-height: 100dvh;
  overflow-y: auto;     /* scroll tetap aktif */
  overflow-x: clip;     /* cegah scroll horizontal */
  scrollbar-width: none;         /* Firefox */
  -ms-overflow-style: none;      /* IE/Edge legacy */
  overscroll-behavior-y: contain;/* hindari bounce menambah scrollbar */
}
.movie-page::-webkit-scrollbar { /* WebKit */
  width: 0;
  height: 0;
  display: none;
}

/* Pastikan background blur tidak meluber memicu scrollbar */
.movie-detail__hero { overflow: clip; }

/* Jika daftar cast bisa scroll horizontal di mobile, sembunyikan juga scroller-nya */
.cast {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.cast::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
</style>