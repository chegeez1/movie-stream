import React from 'react'
import { Download, CheckCircle, AlertCircle } from 'lucide-react'
import { formatters } from '../../utils/formatters'
import '../../styles/components/download-progress.css'

const DownloadProgress = ({ 
  download, 
  onCancel,
  showDetails = true 
}) => {
  const {
    id,
    movieTitle,
    quality,
    progress = 0,
    status = 'downloading',
    size,
    speed
  } = download

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />
      case 'error':
        return <AlertCircle size={16} className="status-icon error" />
      case 'downloading':
      default:
        return <Download size={16} className="status-icon downloading" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Download completed'
      case 'error':
        return 'Download failed'
      case 'paused':
        return 'Download paused'
      case 'downloading':
      default:
        return progress >= 100 ? 'Processing...' : 'Downloading...'
    }
  }

  const handleCancel = () => {
    if (onCancel && status === 'downloading') {
      onCancel(id)
    }
  }

  return (
    <div className={`download-progress ${status}`}>
      <div className="progress-header">
        <div className="progress-info">
          {getStatusIcon()}
          <div className="progress-text">
            <span className="movie-title">{movieTitle}</span>
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>

        {status === 'downloading' && onCancel && (
          <button 
            className="cancel-btn"
            onClick={handleCancel}
            aria-label="Cancel download"
          >
            ×
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-percent">{Math.round(progress)}%</span>
      </div>

      {/* Download Details */}
      {showDetails && (
        <div className="download-details">
          <div className="detail-item">
            <span className="label">Quality:</span>
            <span className="value">{quality}</span>
          </div>
          
          {size && (
            <div className="detail-item">
              <span className="label">Size:</span>
              <span className="value">{formatters.formatFileSize(size)}</span>
            </div>
          )}
          
          {speed && status === 'downloading' && (
            <div className="detail-item">
              <span className="label">Speed:</span>
              <span className="value">{speed}</span>
            </div>
          )}

          {status === 'downloading' && progress > 0 && (
            <div className="detail-item">
              <span className="label">ETA:</span>
              <span className="value">
                {progress < 100 ? 'Calculating...' : 'Complete'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DownloadProgress
