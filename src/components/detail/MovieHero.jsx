import React from 'react'
import { Play, Download, Heart, Share2, Star, Calendar, Clock, Users } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
import { helpers } from '../../utils/helpers'
import { formatters } from '../../utils/formatters'
import QualityBadge from '../movies/QualityBadge'
import '../../styles/components/movie-hero.css'

const MovieHero = ({ 
  movie, 
  onPlayTrailer, 
  onDownload, 
  onShare 
}) => {
  const { isFavorite, toggleFavorite } = useFavorites()

  if (!movie?.subject) return null

  const { subject } = movie
  const isFav = isFavorite(subject.subjectId)

  const handleFavoriteClick = () => {
    toggleFavorite(subject)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: subject.title,
        text: subject.description,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      // You can add a toast notification here
      console.log('URL copied to clipboard')
    }
  }

  return (
    <section 
      className="movie-hero"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${subject.stills?.url})`
      }}
    >
      <div className="movie-hero-container">
        <div className="movie-hero-content">
          {/* Poster */}
          <div className="movie-poster-large">
            <img 
              src={subject.cover?.url} 
              alt={subject.title}
              className="poster-image"
            />
            <QualityBadge quality="HD" size="large" />
          </div>

          {/* Movie Info */}
          <div className="movie-hero-info">
            <h1 className="movie-title">{subject.title}</h1>
            
            {subject.postTitle && (
              <p className="movie-tagline">{subject.postTitle}</p>
            )}

            {/* Movie Stats */}
            <div className="movie-stats">
              {subject.imdbRatingValue && (
                <div className="stat">
                  <Star className="stat-icon" fill="currentColor" />
                  <span className="stat-value">
                    {formatters.formatRating(subject.imdbRatingValue)}
                  </span>
                  <span className="stat-label">IMDb</span>
                </div>
              )}

              <div className="stat">
                <Calendar className="stat-icon" />
                <span className="stat-value">
                  {helpers.getYearFromDate(subject.releaseDate)}
                </span>
                <span className="stat-label">Year</span>
              </div>

              {subject.duration && (
                <div className="stat">
                  <Clock className="stat-icon" />
                  <span className="stat-value">
                    {helpers.formatDuration(subject.duration)}
                  </span>
                  <span className="stat-label">Duration</span>
                </div>
              )}

              {subject.imdbRatingCount && (
                <div className="stat">
                  <Users className="stat-icon" />
                  <span className="stat-value">
                    {formatters.formatSocialNumber(subject.imdbRatingCount)}
                  </span>
                  <span className="stat-label">Votes</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {subject.genre && (
              <div className="movie-genres">
                {subject.genre.split(',').map(genre => (
                  <span key={genre} className="genre-tag">
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {subject.description && (
              <div className="movie-description">
                <p>{subject.description}</p>
              </div>
            )}

            {/* Country */}
            {subject.countryName && (
              <div className="movie-country">
                <strong>Country: </strong>
                {subject.countryName}
              </div>
            )}

            {/* Action Buttons */}
            <div className="movie-actions">
              <button 
                className="btn btn-primary"
                onClick={onPlayTrailer}
                disabled={!subject.trailer}
              >
                <Play size={20} />
                Watch Trailer
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={onDownload}
              >
                <Download size={20} />
                Download
              </button>

              <button 
                className={`btn btn-icon ${isFav ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
              </button>

              <button 
                className="btn btn-icon"
                onClick={handleShare}
                aria-label="Share movie"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MovieHero
