import React from 'react'
import { Download, X, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatters } from '../../utils/formatters'
import { downloadHelpers } from '../../utils/downloadHelpers'
import QualityBadge from '../movies/QualityBadge'
import '../../styles/components/download-card.css'

const DownloadCard = ({ 
  download, 
  onCancel, 
  onRemove,
  type = 'active' // 'active', 'queued', 'completed'
}) => {
  const getStatusIcon = () => {
    switch (type) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />
      case 'queued':
        return <Clock size={16} className="status-icon queued" />
      case 'active':
        return <Download size={16} className="status-icon active" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (type) {
      case 'completed':
        return 'Completed'
      case 'queued':
        return 'Queued'
      case 'active':
        return downloadHelpers.getProgressText(download.progress)
      default:
        return ''
    }
  }

  const handleCancel = () => {
    if (onCancel && type === 'active') {
      onCancel(download.id)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove(download.id)
    }
  }

  return (
    <div className={`download-card ${type}`}>
      <div className="download-info">
        <div className="download-header">
          <h4 className="download-title" title={download.movieTitle}>
            {download.movieTitle}
          </h4>
          <QualityBadge quality={download.quality} />
        </div>

        <div className="download-details">
          <div className="download-status">
            {getStatusIcon()}
            <span className="status-text">{getStatusText()}</span>
          </div>

          {download.size && (
            <span className="file-size">
              {formatters.formatFileSize(download.size)}
            </span>
          )}

          {type === 'active' && download.progress > 0 && (
            <span className="download-speed">~2.5 MB/s</span>
          )}
        </div>

        {/* Progress Bar for Active Downloads */}
        {type === 'active' && (
          <div className="download-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${download.progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(download.progress)}%</span>
          </div>
        )}

        {/* Completed Time */}
        {type === 'completed' && download.completedAt && (
          <div className="completed-time">
            Completed {formatters.formatDate(download.completedAt, { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>

      <div className="download-actions">
        {type === 'active' && (
          <button 
            className="action-btn cancel"
            onClick={handleCancel}
            aria-label="Cancel download"
          >
            <X size={16} />
          </button>
        )}
        
        {(type === 'queued' || type === 'completed') && (
          <button 
            className="action-btn remove"
            onClick={handleRemove}
            aria-label="Remove download"
          >
            <X size={16} />
          </button>
        )}

        {type === 'completed' && (
          <button 
            className="action-btn open"
            onClick={() => window.open(download.url, '_blank')}
            aria-label="Open file location"
          >
            <CheckCircle size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default DownloadCard
