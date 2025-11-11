export const APP_CONSTANTS = {
  APP_NAME: 'MovieStream',
  VERSION: '1.0.0',
  DEFAULT_SEARCH_PLACEHOLDER: 'Search for movies, TV shows...',
  ITEMS_PER_PAGE: 24,
  MAX_RECENT_SEARCHES: 10,
  MAX_FAVORITES: 100,
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'mkv', 'avi'],
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
  DEBOUNCE_DELAY: 500
}

export const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Family', 'History',
  'Music', 'War', 'Western'
]

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'title', label: 'Title A-Z' }
]
