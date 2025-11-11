export class DownloadManager {
  constructor() {
    this.downloads = new Map()
  }

  async startDownload(downloadItem) {
    const { id, url, filename, onProgress, onComplete, onError } = downloadItem
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentLength = response.headers.get('content-length')
      const total = parseInt(contentLength, 10)
      let loaded = 0

      const reader = response.body.getReader()
      const chunks = []

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        chunks.push(value)
        loaded += value.length
        
        if (onProgress && total) {
          const progress = (loaded / total) * 100
          onProgress(progress)
        }
      }

      const blob = new Blob(chunks)
      const downloadUrl = URL.createObjectURL(blob)
      
      // Create download link
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Clean up
      URL.revokeObjectURL(downloadUrl)
      
      if (onComplete) {
        onComplete()
      }

      this.downloads.delete(id)
      
    } catch (error) {
      console.error('Download error:', error)
      if (onError) {
        onError(error)
      }
      this.downloads.delete(id)
    }
  }

  cancelDownload(id) {
    // Implementation for canceling downloads
    this.downloads.delete(id)
  }

  getDownload(id) {
    return this.downloads.get(id)
  }

  getAllDownloads() {
    return Array.from(this.downloads.values())
  }
}

export const downloadManager = new DownloadManager()
