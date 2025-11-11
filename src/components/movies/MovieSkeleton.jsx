import React from 'react'
import '../../styles/components/movie-skeleton.css'

const MovieSkeleton = ({ count = 12 }) => {
  return (
    <div className="movie-skeleton-grid">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="movie-skeleton-card">
          <div className="skeleton-poster"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-meta">
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
            </div>
            <div className="skeleton-genres">
              <div className="skeleton-genre"></div>
              <div className="skeleton-genre"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const MovieListSkeleton = ({ count = 6 }) => {
  return (
    <div className="movie-list-skeleton">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="movie-list-skeleton-item">
          <div className="skeleton-poster"></div>
          <div className="skeleton-details">
            <div className="skeleton-title"></div>
            <div className="skeleton-meta">
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
            </div>
            <div className="skeleton-description"></div>
            <div className="skeleton-actions">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MovieSkeleton
