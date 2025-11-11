import React from 'react'
import '../../styles/components/quality-badge.css'

const QualityBadge = ({ quality = 'HD', size = 'medium' }) => {
  const getQualityColor = (qual) => {
    switch (qual.toUpperCase()) {
      case '4K':
        return 'quality-4k'
      case 'HD':
      case '720P':
        return 'quality-hd'
      case 'SD':
      case '480P':
        return 'quality-sd'
      case '360P':
        return 'quality-low'
      default:
        return 'quality-sd'
    }
  }

  return (
    <span className={`quality-badge ${getQualityColor(quality)} ${size}`}>
      {quality.toUpperCase()}
    </span>
  )
}

export default QualityBadge
