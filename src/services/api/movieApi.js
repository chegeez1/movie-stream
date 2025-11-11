import apiClient from './apiClient'
import { 
  getSearchEndpoint, 
  getMovieInfoEndpoint, 
  getDownloadSourcesEndpoint 
} from './endpoints'
import { cache } from '../cache/cache'
import { CACHE_DURATION } from '../../constants/api'

export const movieAPI = {
  // Search movies with caching and retry logic
  search: async (query, page = 1) => {
    const cacheKey = `search_${query}_${page}`
    
    const cached = cache.get(cacheKey)
    if (cached) {
      console.log('📦 Returning cached search results')
      return cached
    }

    try {
      const response = await apiClient.get(getSearchEndpoint(query))
      const data = response.data
      
      if (data.status === 200 && data.success) {
        cache.set(cacheKey, data, CACHE_DURATION.SEARCH)
        return data
      } else {
        throw new Error('Search failed: Invalid response format')
      }
    } catch (error) {
      console.error('🔍 Search API error:', error)
      throw error
    }
  },

  // Get detailed movie information
  getInfo: async (id) => {
    const cacheKey = `info_${id}`
    
    const cached = cache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await apiClient.get(getMovieInfoEndpoint(id))
      const data = response.data
      
      if (data.status === 200 && data.success) {
        cache.set(cacheKey, data, CACHE_DURATION.MOVIE_INFO)
        return data
      } else {
        throw new Error('Movie info not found')
      }
    } catch (error) {
      console.error('🎬 Movie info API error:', error)
      throw error
    }
  },

  // Get download sources
  getSources: async (id, season = null, episode = null) => {
    const cacheKey = `sources_${id}_${season}_${episode}`
    
    const cached = cache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await apiClient.get(getDownloadSourcesEndpoint(id, season, episode))
      const data = response.data
      
      if (data.status === 200 && data.success) {
        cache.set(cacheKey, data, CACHE_DURATION.SOURCES)
        return data
      } else {
        throw new Error('No download sources available')
      }
    } catch (error) {
      console.error('📥 Sources API error:', error)
      throw error
    }
  },

  // Get trending movies (mock implementation for now)
  getTrending: async () => {
    const cacheKey = 'trending_movies'
    const cached = cache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // For now, search for popular movies as trending
      const data = await movieAPI.search('avengers')
      cache.set(cacheKey, data, 60 * 60 * 1000) // Cache for 1 hour
      return data
    } catch (error) {
      console.error('🔥 Trending movies API error:', error)
      throw error
    }
  }
}
