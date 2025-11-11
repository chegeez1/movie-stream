export const formatters = {
  // Format number with commas
  formatNumber: (num) => {
    if (!num) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Format date
  formatDate: (dateString, options = {}) => {
    if (!dateString) return 'N/A'
    
    const defaultOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    
    return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options })
  },

  // Format rating
  formatRating: (rating) => {
    if (!rating) return 'N/A'
    return parseFloat(rating).toFixed(1)
  },

  // Format duration for display
  formatDuration: (seconds) => {
    if (!seconds) return 'N/A'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`
    }
    return `${minutes}m`
  },

  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  // Format percentage
  formatPercentage: (value, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`
  },

  // Format social numbers (like 1.5K, 2.3M)
  formatSocialNumber: (num) => {
    if (!num) return '0'
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
}
