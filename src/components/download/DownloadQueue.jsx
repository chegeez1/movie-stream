import React from 'react'
import { Download, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { useDownload } from '../../context/DownloadContext'
import DownloadCard from './DownloadCard'
import '../../styles/components/download-queue.css'

const DownloadQueue = () => {
  const { 
    downloadQueue, 
    activeDownloads, 
    completedDownloads, 
    removeFromQueue, 
    cancelDownload,
    clearCompleted 
  } = useDownload()

  const hasDownloads = downloadQueue.length > 0 || 
                      activeDownloads.length > 0 || 
                      completedDownloads.length > 0

  if (!hasDownloads) {
    return (
      <div className="download-queue empty">
        <div className="empty-state">
          <Download size={48} className="empty-icon" />
          <h3>No Active Downloads</h3>
          <p>Your download queue is empty. Start downloading movies to see them here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="download-queue">
      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <section className="download-section">
          <h3 className="section-title">
            <Download size={20} />
            Downloading ({activeDownloads.length})
          </h3>
          <div className="downloads-list">
            {activeDownloads.map(download => (
              <DownloadCard
                key={download.id}
                download={download}
                type="active"
                onCancel={cancelDownload}
              />
            ))}
          </div>
        </section>
      )}

      {/* Queued Downloads */}
      {downloadQueue.length > 0 && (
        <section className="download-section">
          <h3 className="section-title">
            <Clock size={20} />
            Queued ({downloadQueue.length})
          </h3>
          <div className="downloads-list">
            {downloadQueue.map(download => (
              <DownloadCard
                key={download.id}
                download={download}
                type="queued"
                onRemove={removeFromQueue}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Downloads */}
      {completedDownloads.length > 0 && (
        <section className="download-section">
          <div className="section-header">
            <h3 className="section-title">
              <CheckCircle size={20} />
              Completed ({completedDownloads.length})
            </h3>
            <button 
              className="clear-completed-btn"
              onClick={clearCompleted}
              aria-label="Clear all completed downloads"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
          <div className="downloads-list">
            {completedDownloads.map(download => (
              <DownloadCard
                key={download.id}
                download={download}
                type="completed"
                onRemove={removeFromQueue}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default DownloadQueue
