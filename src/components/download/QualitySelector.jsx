import React from 'react'
import { CheckCircle } from 'lucide-react'
import { QUALITY_OPTIONS } from '../../constants/api'
import QualityBadge from '../movies/QualityBadge'
import '../../styles/components/quality-selector.css'

const QualitySelector = ({
  sources = [],
  selectedQuality,
  onQualitySelect,
  className = ''
}) => {
  const availableQualities = QUALITY_OPTIONS.filter(quality =>
    sources.some(source => source.quality === quality.value)
  )

  if (availableQualities.length === 0) {
    return (
      <div className={`quality-selector ${className}`}>
        <p className="no-qualities">No quality options available</p>
      </div>
    )
  }

  return (
    <div className={`quality-selector ${className}`}>
      <h4 className="selector-title">Select Quality</h4>
      
      <div className="quality-options">
        {availableQualities.map(quality => {
          const source = sources.find(s => s.quality === quality.value)
          const isSelected = selectedQuality?.quality === quality.value
          const isAvailable = !!source

          return (
            <div
              key={quality.value}
              className={`quality-option ${isSelected ? 'selected' : ''} ${
                !isAvailable ? 'unavailable' : ''
              }`}
              onClick={() => isAvailable && onQualitySelect(source)}
            >
              <div className="option-content">
                <QualityBadge quality={quality.value} />
                <span className="quality-label">{quality.label}</span>
                
                {source?.size && (
                  <span className="quality-size">
                    ({Math.round(source.size / 1024 / 1024)}MB)
                  </span>
                )}
              </div>

              {isSelected && (
                <CheckCircle size={16} className="selected-icon" />
              )}

              {!isAvailable && (
                <span className="unavailable-text">Unavailable</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QualitySelector
