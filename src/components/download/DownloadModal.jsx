import React, { useState, useEffect } from 'react'
import { Download, File, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useDownloadManager } from '../../hooks/useDownloadManager'
import { downloadHelpers } from '../../utils/downloadHelpers'
import { formatters } from '../../utils/formatters'
import QualityBadge from '../movies/QualityBadge'
import '../../styles/components/download-modal.css'

const DownloadModal = ({ 
  isOpen, 
  onClose, 
  movieId, 
  movieTitle, 
  sources = [] 
}) => {
  const [selectedQuality, setSelectedQuality] = useState(null)
  const { downloadFile } = useDownloadManager()

  useEffect(() => {
    if (sources.length > 0 && !selectedQuality) {
      const bestQuality = downloadHelpers.getBestQuality(sources)
      setSelectedQuality(bestQuality)
    }
  }, [sources, selectedQuality])

  const handleDownload = (source) => {
    if (!source) return

    const downloadInfo = downloadHelpers.getDownloadInfo(source)
    if (!downloadInfo.isValid) {
      console.error('Unsupported download format')
      return
    }

    downloadFile({
      id: `${movieId}_${source.quality}`,
      url: source.download_url,
      movieTitle,
      quality: source.quality,
      size: source.size
    })

    onClose()
  }

  const sortedSources = downloadHelpers.sortSourcesByQuality(sources)

  if (!isOpen) return null

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal" onClick={e => e.stopPropagation()}>
        <div className="download-modal-header">
          <h2>Download {movieTitle}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="download-modal-content">
          {sources.length === 0 ? (
            <div className="no-sources">
              <AlertCircle size={48} className="error-icon" />
              <h3>No Download Sources Available</h3>
              <p>Sorry, there are no download options for this movie at the moment.</p>
            </div>
          ) : (
            <>
              <div className="download-options">
                {sortedSources.map(source => {
                  const downloadInfo = downloadHelpers.getDownloadInfo(source)
                  const isSupported = downloadInfo.isValid
                  const isSelected = selectedQuality?.id === source.id

                  return (
                    <div
                      key={source.id}
                      className={`download-option ${isSelected ? 'selected' : ''} ${
                        !isSupported ? 'unsupported' : ''
                      }`}
                      onClick={() => isSupported && setSelectedQuality(source)}
                    >
                      <div className="option-header">
                        <QualityBadge quality={source.quality} />
                        {isSelected && (
                          <CheckCircle size={16} className="selected-icon" />
                        )}
                      </div>

                      <div className="option-details">
                        <span className="file-size">
                          {formatters.formatFileSize(parseInt(source.size) || 0)}
                        </span>
                        <span className="file-format">{source.format || 'mp4'}</span>
                      </div>

                      {!isSupported && (
                        <div className="unsupported-warning">
                          <AlertCircle size={14} />
                          <span>Unsupported format</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedQuality && (
                <div className="download-preview">
                  <div className="preview-header">
                    <h4>Selected Quality</h4>
                    <QualityBadge quality={selectedQuality.quality} />
                  </div>
                  
                  <div className="preview-details">
                    <div className="detail-item">
                      <span className="label">File Size:</span>
                      <span className="value">
                        {formatters.formatFileSize(parseInt(selectedQuality.size) || 0)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Format:</span>
                      <span className="value">{selectedQuality.format || 'mp4'}</span>
                    </div>
                  </div>

                  <button
                    className="download-confirm-btn"
                    onClick={() => handleDownload(selectedQuality)}
                    disabled={!downloadHelpers.getDownloadInfo(selectedQuality).isValid}
                  >
                    <Download size={18} />
                    Start Download
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DownloadModal
