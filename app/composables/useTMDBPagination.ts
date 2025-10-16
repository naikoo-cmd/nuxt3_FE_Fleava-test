import { ref, reactive, computed, watch } from 'vue'

type Category = 'popular' | 'top_rated' | 'upcoming'
type TMDBMovie = {
  id: number
  title: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
}
type TMDBResponse = {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

const TMDB_PAGE_SIZE = 20
const MAX_API_PAGES = 1000 // TMDB hard cap (common across list endpoints)
const endpoints: Record<Category, string> = {
  popular: '/api/tmdb/popular',
  top_rated: '/api/tmdb/top_rated',
  upcoming: '/api/tmdb/upcoming'
}

export function useTMDBPagination() {
  const config = useRuntimeConfig()
  const img = (path: string | null, size: string) =>
    path ? `${config.public.tmdbImageBase}/${size}${path}` : ''

  const category = ref<Category>('popular')
  const page = ref(1)
  const pageSize = ref<10 | 20 | 30>(20)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Per-category API cache (apiPage -> results[])
  const cache = reactive<Record<Category, Record<number, TMDBMovie[]>>>({
    popular: {},
    top_rated: {},
    upcoming: {}
  })
  const totals = reactive<Record<Category, { totalResults: number; totalApiPages: number }>>({
    popular: { totalResults: 0, totalApiPages: 0 },
    top_rated: { totalResults: 0, totalApiPages: 0 },
    upcoming: { totalResults: 0, totalApiPages: 0 }
  })

  // Dedup permintaan per (kategori, apiPage) agar tidak fetch dobel
  const inFlight = reactive<Record<Category, Record<number, Promise<TMDBMovie[]>>>>({
    popular: {},
    top_rated: {},
    upcoming: {}
  })

  async function fetchApiPage(cat: Category, apiPage: number) {
    if (cache[cat][apiPage]) return cache[cat][apiPage]
    if (inFlight[cat][apiPage]) return await inFlight[cat][apiPage]

    const p = (async () => {
      try {
        loading.value = true
        error.value = null
        const res = await $fetch<TMDBResponse>(endpoints[cat], { query: { page: apiPage } })
        cache[cat][apiPage] = res.results
        totals[cat].totalResults = res.total_results
        totals[cat].totalApiPages = res.total_pages
        return res.results
      } catch (e: any) {
        const msg = e?.data?.status_message || e?.statusMessage || e?.message || 'Failed to load movies.'
        error.value = msg
        return []
      } finally {
        loading.value = false
        delete inFlight[cat][apiPage]
      }
    })()

    inFlight[cat][apiPage] = p
    return await p
  }

  async function ensureMeta(cat: Category) {
    if (totals[cat].totalResults === 0) {
      await fetchApiPage(cat, 1)
    }
  }

  function neededApiPages(startIndex: number, count: number) {
    const end = Math.max(startIndex + count - 1, startIndex)
    const first = Math.floor(startIndex / TMDB_PAGE_SIZE) + 1
    const last = Math.floor(end / TMDB_PAGE_SIZE) + 1
    const pages: number[] = []
    for (let p = first; p <= last; p++) pages.push(p)
    return pages
  }

  async function ensureSlice(cat: Category, startIndex: number, count: number) {
    await ensureMeta(cat)
    const pages = neededApiPages(startIndex, count)
    for (const p of pages) {
      if (!cache[cat][p]) {
        await fetchApiPage(cat, p)
      }
    }
  }

  function uiMap(m: TMDBMovie) {
    const posterSm = img(m.poster_path, 'w342')
    const posterMd = img(m.poster_path, 'w500')
    const posterLg = img(m.poster_path, 'w780')
    const backdrop = img(m.backdrop_path, 'w1280')
    return {
      id: m.id,
      title: m.title || m.name || 'Untitled',
      overview: m.overview,
      poster: posterMd,
      posterSet: posterSm && posterMd && posterLg ? `${posterSm} 342w, ${posterMd} 500w, ${posterLg} 780w` : undefined,
      backdrop,
      image: backdrop || posterMd, // NEW: slideshow image source
      year: (m.release_date || m.first_air_date || '').slice(0, 4),
      rating: m.vote_average
    }
  }

  // Current page items (filled after ensure)
  const movies = ref<any[]>([])
  // Slides use the first API page of current category
  const slides = computed(() => (cache[category.value][1] || []).slice(0, 5).map(uiMap))

  const totalResults = computed(() => totals[category.value].totalResults)
  const totalPages = computed(() => {
    // Use API page cap to avoid inflated totals (TMDB caps available pages)
    const apiPages = Math.min(totals[category.value].totalApiPages || 0, MAX_API_PAGES)
    const availableResults = apiPages * TMDB_PAGE_SIZE
    const effectiveTotal = Math.max(0, Math.min(totalResults.value || 0, availableResults))
    const size = pageSize.value
    return effectiveTotal ? Math.max(1, Math.ceil(effectiveTotal / size)) : 1
  })

  const pagesWindow = computed(() => {
    // Compact pager: first, prev window, current +/- 2, last
    const maxShown = 9
    const last = totalPages.value
    const cur = Math.min(Math.max(1, page.value), last)
    const pages = new Set<number>()
    pages.add(1)
    for (let i = cur - 2; i <= cur + 2; i++) if (i >= 1 && i <= last) pages.add(i)
    pages.add(last)
    const arr = Array.from(pages).sort((a, b) => a - b)
    if (arr.length > maxShown) {
      // fallback to a simple window
      const start = Math.max(1, cur - 4)
      const end = Math.min(last, start + maxShown - 1)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }
    return arr
  })

  // Prefetch halaman API berikutnya saat idle (lazy), tidak blocking UI
  function prefetchNext(cat: Category, startIndex: number, count: number) {
    const endIndex = startIndex + Math.max(0, count - 1)
    const endApi = Math.floor(endIndex / TMDB_PAGE_SIZE) + 1
    const nextApi = endApi + 1
    const maxApi = totals[cat].totalApiPages || 0
    if (nextApi <= 0 || (maxApi && nextApi > maxApi)) return
    if (cache[cat][nextApi] || inFlight[cat][nextApi]) return

    // Nuxt sudah expose requestIdleCallback di auto-imports
    requestIdleCallback?.(() => { fetchApiPage(cat, nextApi) })
  }

  async function goToPage(n: number) {
    const last = totalPages.value || 1
    page.value = Math.min(Math.max(1, n), last)
    const size = pageSize.value
    const startIndex = (page.value - 1) * size
    await ensureSlice(category.value, startIndex, size)

    const startApi = Math.floor(startIndex / TMDB_PAGE_SIZE) + 1
    const endApi = Math.floor((startIndex + size - 1) / TMDB_PAGE_SIZE) + 1
    const buf: TMDBMovie[] = []
    for (let p = startApi; p <= endApi; p++) {
      const chunk = cache[category.value][p] || []
      buf.push(...chunk)
    }
    const withinApiStart = startIndex - (startApi - 1) * TMDB_PAGE_SIZE
    const pageSlice = buf.slice(withinApiStart, withinApiStart + size)

    // Deduplicate by id within the slice
    const seen = new Set<number>()
    const unique = pageSlice.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })
    movies.value = unique.map(uiMap)

    // Prefetch next API page lazily (still respecting cap)
    prefetchNext(category.value, startIndex, size)
  }

  function setCategory(c: Category) {
    category.value = c
  }

  // React to category/page/pageSize changes
  watch(category, async () => {
    error.value = null
    page.value = 1
    await ensureMeta(category.value) // ensures slides
    await goToPage(1)
  }, { immediate: true })

  watch(pageSize, async () => {
    page.value = 1
    await goToPage(1)
  })

  return {
    // state
    category, setCategory, page, pageSize, totalPages,
    // data
    slides, movies,
    // status
    loading, error,
    // actions
    goToPage,
    pagesWindow
  }
}