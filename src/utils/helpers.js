import { GENRES } from '../constants/app'

export const helpers = {
  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Capitalize first letter
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  // Format duration from seconds to hours and minutes
  formatDuration: (seconds) => {
    if (!seconds) return 'N/A'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  },

  // Truncate text with ellipsis
  truncateText: (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  },

  // Check if image URL is valid
  isValidImageUrl: (url) => {
    if (!url) return false
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null
  },

  // Get year from date string
  getYearFromDate: (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).getFullYear()
  },

  // Sort movies by various criteria
  sortMovies: (movies, sortBy) => {
    const sorted = [...movies]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
      
      case 'rating':
        return sorted.sort((a, b) => parseFloat(b.imdbRatingValue) - parseFloat(a.imdbRatingValue))
      
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      
      case 'relevance':
      default:
        return sorted
    }
  },

  // Filter movies by genre
  filterMoviesByGenre: (movies, genre) => {
    if (!genre || genre === 'all') return movies
    return movies.filter(movie => 
      movie.genre && movie.genre.toLowerCase().includes(genre.toLowerCase())
    )
  },

  // Get unique genres from movies
  getUniqueGenres: (movies) => {
    const allGenres = movies.flatMap(movie => 
      movie.genre ? movie.genre.split(',').map(g => g.trim()) : []
    )
    return [...new Set(allGenres)].sort()
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Deep clone object
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj))
  }
}
