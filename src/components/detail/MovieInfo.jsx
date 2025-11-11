import React from 'react'
import { Film, Globe, Captions, Calendar } from 'lucide-react'
import { helpers } from '../../utils/helpers'
import { formatters } from '../../utils/formatters'
import '../../styles/components/movie-info.css'

const MovieInfo = ({ movie }) => {
  if (!movie?.subject) return null

  const { subject } = movie

  const infoSections = [
    {
      title: 'Details',
      icon: Film,
      items: [
        { label: 'Release Date', value: formatters.formatDate(subject.releaseDate) },
        { label: 'Duration', value: helpers.formatDuration(subject.duration) },
        { label: 'Genre', value: subject.genre },
        { label: 'Country', value: subject.countryName }
      ]
    },
    {
      title: 'Technical Info',
      icon: Globe,
      items: [
        { label: 'IMDb Rating', value: `${formatters.formatRating(subject.imdbRatingValue)}/10` },
        { label: 'Rating Count', value: formatters.formatNumber(subject.imdbRatingCount) },
        { label: 'Available Subtitles', value: subject.subtitles ? `${subject.subtitles.split(',').length} languages` : 'None' }
      ]
    }
  ].filter(section => section.items.some(item => item.value))

  return (
    <div className="movie-info">
      <h2 className="section-title">Movie Information</h2>
      
      <div className="info-sections">
        {infoSections.map(section => (
          <div key={section.title} className="info-section">
            <div className="section-header">
              <section.icon size={20} />
              <h3>{section.title}</h3>
            </div>
            
            <div className="info-grid">
              {section.items
                .filter(item => item.value && item.value !== 'N/A')
                .map(item => (
                  <div key={item.label} className="info-item">
                    <span className="info-label">{item.label}:</span>
                    <span className="info-value">{item.value}</span>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>

      {/* Subtitles */}
      {subject.subtitles && (
        <div className="subtitles-section">
          <div className="section-header">
            <Captions size={20} />
            <h3>Available Subtitles</h3>
          </div>
          <div className="subtitles-list">
            {subject.subtitles.split(',').map((subtitle, index) => (
              <span key={index} className="subtitle-tag">
                {subtitle.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MovieInfo
