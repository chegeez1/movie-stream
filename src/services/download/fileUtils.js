export const fileUtils = {
  // Format file size to human readable format
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Get file extension from URL
  getFileExtension: (url) => {
    return url.split('.').pop().toLowerCase()
  },

  // Validate if file type is supported
  isSupportedFormat: (url) => {
    const extension = fileUtils.getFileExtension(url)
    const supportedFormats = ['mp4', 'mkv', 'avi', 'mov', 'wmv']
    return supportedFormats.includes(extension)
  },

  // Generate filename from movie title and quality
  generateFilename: (movieTitle, quality, extension = 'mp4') => {
    const cleanTitle = movieTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    return `${cleanTitle}_${quality}.${extension}`
  },

  // Check if file size is within limits
  isValidFileSize: (size, maxSize = 2 * 1024 * 1024 * 1024) => {
    return size <= maxSize
  }
}
