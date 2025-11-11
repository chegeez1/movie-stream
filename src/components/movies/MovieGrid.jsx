import React from 'react'
import MovieCard from './MovieCard'
import MovieSkeleton from './MovieSkeleton'
import '../../styles/components/movie-grid.css'

const MovieGrid = ({ 
  movies, 
  loading = false, 
  error = null, 
  skeletonCount = 12,
  emptyMessage = "No movies found",
  showDownloadBadge = false 
}) => {
  if (loading) {
    return <MovieSkeleton count={skeletonCount} />
  }

  if (error) {
    return (
      <div className="movie-grid-error">
        <div className="error-content">
          <h3>Unable to load movies</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="movie-grid-empty">
        <div className="empty-content">
          <h3>{emptyMessage}</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <MovieCard 
          key={movie.subjectId} 
          movie={movie} 
          showDownloadBadge={showDownloadBadge}
        />
      ))}
    </div>
  )
}

export default MovieGrid
