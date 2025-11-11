import { QUALITY_OPTIONS } from '../constants/api'
import { fileUtils } from '../services/download/fileUtils'

export const downloadHelpers = {
  // Get best quality available
  getBestQuality: (sources) => {
    if (!sources || sources.length === 0) return null
    
    const qualityPriority = {
      '720p': 3,
      '480p': 2,
      '360p': 1
    }
    
    return sources.reduce((best, current) => {
      const currentPriority = qualityPriority[current.quality] || 0
      const bestPriority = qualityPriority[best.quality] || 0
      return currentPriority > bestPriority ? current : best
    })
  },

  // Sort sources by quality
  sortSourcesByQuality: (sources) => {
    const qualityOrder = { '720p': 1, '480p': 2, '360p': 3 }
    return [...sources].sort((a, b) => {
      return qualityOrder[a.quality] - qualityOrder[b.quality]
    })
  },

  // Get download info for display
  getDownloadInfo: (source) => {
    if (!source) return null
    
    return {
      id: source.id,
      quality: source.quality,
      url: source.download_url,
      size: fileUtils.formatFileSize(parseInt(source.size) || 0),
      format: source.format || 'mp4',
      isValid: fileUtils.isSupportedFormat(source.download_url)
    }
  },

  // Generate download filename
  generateFilename: (movieTitle, quality, format = 'mp4') => {
    const cleanTitle = movieTitle
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
    
    return `${cleanTitle}_${quality}.${format}`
  },

  // Check if download is supported
  isDownloadSupported: (source) => {
    if (!source) return false
    
    const supportedFormats = ['mp4', 'mkv', 'avi']
    const fileExtension = fileUtils.getFileExtension(source.download_url)
    
    return supportedFormats.includes(fileExtension.toLowerCase())
  },

  // Get download progress text
  getProgressText: (progress) => {
    if (progress >= 100) return 'Completed'
    if (progress > 0) return `${Math.round(progress)}%`
    return 'Starting...'
  }
}
