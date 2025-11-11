export const API_CONFIG = {
  BASE_URL: 'https://movieapi.giftedtech.co.ke/api',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

export const ENDPOINTS = {
  SEARCH: '/search',
  MOVIE_INFO: '/info',
  DOWNLOAD_SOURCES: '/sources'
}

export const CACHE_DURATION = {
  SEARCH: 5 * 60 * 1000, // 5 minutes
  MOVIE_INFO: 10 * 60 * 1000, // 10 minutes
  SOURCES: 30 * 60 * 1000 // 30 minutes
}

export const QUALITY_OPTIONS = [
  { value: '720p', label: 'HD 720p', priority: 3 },
  { value: '480p', label: 'SD 480p', priority: 2 },
  { value: '360p', label: 'SD 360p', priority: 1 }
]
