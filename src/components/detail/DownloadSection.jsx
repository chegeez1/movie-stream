import React, { useState } from 'react'
import { Download, File, CheckCircle, AlertCircle } from 'lucide-react'
import { useDownloadManager } from '../../hooks/useDownloadManager'
import { downloadHelpers } from '../../utils/downloadHelpers'
import { formatters } from '../../utils/formatters'
import QualityBadge from '../movies/QualityBadge'
import '../../styles/components/download-section.css'

const DownloadSection = ({ 
  movieId, 
  movieTitle, 
  sources = [], 
  loading = false, 
  error = null 
}) => {
  const [selectedSource, setSelectedSource] = useState(null)
  const { downloadFile } = useDownloadManager()

  const handleDownload = (source) => {
    const downloadInfo = downloadHelpers.getDownloadInfo(source)
    if (!downloadInfo || !downloadInfo.isValid) return

    downloadFile({
      id: `${movieId}_${source.quality}`,
      url: source.download_url,
      movieTitle,
      quality: source.quality,
      size: source.size
    })
  }

  const sortedSources = downloadHelpers.sortSourcesByQuality(sources)
  const bestQuality = downloadHelpers.getBestQuality(sources)

  if (loading) {
    return (
      <div className="download-section">
        <h2 className="section-title">Download Options</h2>
        <div className="downloads-loading">
          <div className="loading-spinner"></div>
          <p>Loading download options...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="download-section">
        <h2 className="section-title">Download Options</h2>
        <div className="downloads-error">
          <AlertCircle size={32} className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="download-section">
        <h2 className="section-title">Download Options</h2>
        <div className="no-downloads">
          <File size={48} className="no-downloads-icon" />
          <p>No download sources available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="download-section">
      <h2 className="section-title">Download Options</h2>
      
      {bestQuality && (
        <div className="best-quality-banner">
          <CheckCircle size={20} />
          <span>Recommended: {bestQuality.quality} - {formatters.formatFileSize(bestQuality.size)}</span>
        </div>
      )}

      <div className="download-options">
        {sortedSources.map(source => {
          const downloadInfo = downloadHelpers.getDownloadInfo(source)
          const isSupported = downloadInfo?.isValid
          
          return (
            <div 
              key={source.id}
              className={`download-option ${!isSupported ? 'unsupported' : ''} ${
                selectedSource?.id === source.id ? 'selected' : ''
              }`}
              onClick={() => isSupported && setSelectedSource(source)}
            >
              <div className="download-info">
                <div className="quality-header">
                  <QualityBadge quality={source.quality} />
                  {!isSupported && (
                    <span className="unsupported-badge">Unsupported Format</span>
                  )}
                </div>
                
                <div className="download-details">
                  <span className="file-size">
                    {formatters.formatFileSize(parseInt(source.size) || 0)}
                  </span>
                  <span className="file-format">{source.format || 'mp4'}</span>
                </div>
              </div>

              <button
                className={`download-btn ${!isSupported ? 'disabled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isSupported) {
                    handleDownload(source)
                  }
                }}
                disabled={!isSupported}
                aria-label={`Download ${source.quality} version`}
              >
                <Download size={18} />
                Download
              </button>
            </div>
          )
        })}
      </div>

      {selectedSource && (
        <div className="download-preview">
          <h4>Selected: {selectedSource.quality}</h4>
          <p>File size: {formatters.formatFileSize(parseInt(selectedSource.size) || 0)}</p>
          <button 
            className="btn btn-primary"
            onClick={() => handleDownload(selectedSource)}
          >
            <Download size={18} />
            Start Download
          </button>
        </div>
      )}
    </div>
  )
}

export default DownloadSection
