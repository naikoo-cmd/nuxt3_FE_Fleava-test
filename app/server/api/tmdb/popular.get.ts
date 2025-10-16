import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { tmdbApiKey, tmdbBaseUrl } = useRuntimeConfig()
  const { page = 1 } = getQuery(event)

  if (!tmdbApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TMDB API key missing',
      data: { code: 'TMDB_API_KEY_MISSING' }
    })
  }

  const url = `${tmdbBaseUrl}/movie/popular?language=en-US&page=${page}`

  // Support v4 Bearer token or v3 api_key
  const isBearer = tmdbApiKey.startsWith('eyJ') || tmdbApiKey.length > 40
  const headers = isBearer ? { Authorization: `Bearer ${tmdbApiKey}` } : undefined
  const finalUrl = isBearer ? url : `${url}&api_key=${tmdbApiKey}`

  try {
    const res = await $fetch(finalUrl, { headers })
    return res // { page, results, total_pages, total_results }
  } catch (e: any) {
    console.error('[tmdb] popular fetch failed', e)
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || 'TMDB fetch failed', data: e?.data })
  }
})