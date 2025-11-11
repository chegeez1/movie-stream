export const validators = {
  // Validate email
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Validate URL
  isUrl: (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Validate movie data
  isValidMovie: (movie) => {
    if (!movie) return false
    if (!movie.subjectId || !movie.title) return false
    return true
  },

  // Validate search query
  isValidSearchQuery: (query) => {
    if (!query || typeof query !== 'string') return false
    if (query.trim().length < 2) return false
    if (query.length > 100) return false
    return true
  },

  // Validate download source
  isValidDownloadSource: (source) => {
    if (!source) return false
    if (!source.download_url || !source.quality) return false
    if (!validators.isUrl(source.download_url)) return false
    return true
  },

  // Validate file size
  isValidFileSize: (size, maxSize = 2 * 1024 * 1024 * 1024) => {
    if (!size || typeof size !== 'number') return false
    return size <= maxSize
  },

  // Validate image URL
  isValidImageUrl: (url) => {
    if (!url || typeof url !== 'string') return false
    if (!validators.isUrl(url)) return false
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
    return imageExtensions.some(ext => url.toLowerCase().includes(ext))
  }
}
