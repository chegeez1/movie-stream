import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Calendar, Clock, Download, Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
import { helpers } from '../../utils/helpers'
import { formatters } from '../../utils/formatters'
import QualityBadge from './QualityBadge'
import '../../styles/components/movie-card.css'

const MovieCard = ({ movie, showDownloadBadge = false }) => {
  const { isFavorite, toggleFavorite } = useFavorites()

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(movie)
  }

  const isFav = isFavorite(movie.subjectId)

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.subjectId}`} className="movie-card-link">
        <div className="movie-poster">
          <img 
            src={movie.cover?.url || movie.thumbnail} 
            alt={movie.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = '/placeholder-movie.jpg'
            }}
          />
          
          {/* Favorite Button */}
          <button 
            className={`favorite-button ${isFav ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
          </button>

          {/* Download Badge */}
          {showDownloadBadge && movie.hasResource && (
            <div className="download-badge">
              <Download size={14} />
              <span>Available</span>
            </div>
          )}

          {/* Rating Badge */}
          {movie.imdbRatingValue && (
            <div className="rating-badge">
              <Star size={12} fill="currentColor" />
              <span>{formatters.formatRating(movie.imdbRatingValue)}</span>
            </div>
          )}

          {/* Quality Badge */}
          <QualityBadge quality="HD" />
        </div>

        <div className="movie-info">
          <h3 className="movie-title" title={movie.title}>
            {helpers.truncateText(movie.title, 40)}
          </h3>
          
          <div className="movie-meta">
            <div className="meta-item">
              <Calendar size={14} />
              <span>{helpers.getYearFromDate(movie.releaseDate)}</span>
            </div>
            
            {movie.duration && (
              <div className="meta-item">
                <Clock size={14} />
                <span>{helpers.formatDuration(movie.duration)}</span>
              </div>
            )}
          </div>

          {movie.genre && (
            <div className="movie-genres">
              {movie.genre.split(',').slice(0, 2).map(genre => (
                <span key={genre} className="genre-tag">
                  {genre.trim()}
                </span>
              ))}
              {movie.genre.split(',').length > 2 && (
                <span className="genre-more">+{movie.genre.split(',').length - 2}</span>
              )}
            </div>
          )}

          {movie.description && (
            <p className="movie-description">
              {helpers.truncateText(movie.description, 80)}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}

export default MovieCard
