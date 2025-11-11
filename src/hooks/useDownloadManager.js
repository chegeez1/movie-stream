import { useState, useCallback } from 'react'
import { useDownload } from '../context/DownloadContext'
import { downloadManager } from '../services/download/downloadManager'
import { fileUtils } from '../services/download/fileUtils'
import { toast } from 'react-toastify'

export const useDownloadManager = () => {
  const { 
    addToQueue, 
    removeFromQueue, 
    startDownload, 
    updateDownloadProgress, 
    completeDownload 
  } = useDownload()

  const downloadFile = useCallback(async (downloadItem) => {
    const { id, url, movieTitle, quality } = downloadItem
    
    // Add to queue
    addToQueue({
      id,
      movieTitle,
      quality,
      url,
      status: 'queued',
      progress: 0,
      addedAt: new Date().toISOString()
    })

    try {
      // Start download
      startDownload({
        id,
        movieTitle,
        quality,
        url,
        status: 'downloading',
        progress: 0,
        startedAt: new Date().toISOString()
      })

      const filename = fileUtils.generateFilename(movieTitle, quality)
      
      await downloadManager.startDownload({
        id,
        url,
        filename,
        onProgress: (progress) => {
          updateDownloadProgress(id, progress)
        },
        onComplete: () => {
          completeDownload(id)
          toast.success(`Download completed: ${movieTitle} (${quality})`)
        },
        onError: (error) => {
          removeFromQueue(id)
          toast.error(`Download failed: ${movieTitle}`)
          console.error('Download error:', error)
        }
      })

    } catch (error) {
      removeFromQueue(id)
      toast.error(`Download failed: ${movieTitle}`)
      console.error('Download error:', error)
    }
  }, [addToQueue, startDownload, updateDownloadProgress, completeDownload, removeFromQueue])

  const cancelDownload = useCallback((id) => {
    downloadManager.cancelDownload(id)
    removeFromQueue(id)
    toast.info('Download cancelled')
  }, [removeFromQueue])

  return {
    downloadFile,
    cancelDownload
  }
}
