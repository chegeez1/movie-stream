import React, { useState, useEffect } from 'react'
import { TrendingUp, Star, Calendar } from 'lucide-react'
import { useMovieSearch } from '../hooks/useMovies'
import MovieGrid from '../components/movies/MovieGrid'
import MovieFilters from '../components/movies/MovieFilters'
import LoadingSpinner from '../components/common/LoadingSpinner'
import PageContainer from '../components/layout/PageContainer'
import Section from '../components/layout/Section'
import { helpers } from '../utils/helpers'
import '../styles/pages/trending.css'

const Trending = () => {
  const [sortBy, setSortBy] = useState('rating')
  const [genre, setGenre] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  // Using search for "avengers" as placeholder for trending
  const { results, loading, error } = useMovieSearch('avengers')
  const filteredResults = helpers.sortMovies(
    helpers.filterMoviesByGenre(results, genre),
    sortBy
  )

  const uniqueGenres = helpers.getUniqueGenres(results)

  return (
    <div className="trending-page">
      <PageContainer>
        {/* Header */}
        <Section padding="medium">
          <div className="trending-header">
            <div className="header-content">
              <div className="header-icon">
                <TrendingUp size={40} />
              </div>
              <div className="header-text">
                <h1>Trending Movies</h1>
                <p>Discover what's popular and trending right now</p>
              </div>
            </div>

            <div className="trending-stats">
              <div className="stat">
                <Star className="stat-icon" />
                <div>
                  <span className="stat-number">{results.length}</span>
                  <span className="stat-label">Movies</span>
                </div>
              </div>
              <div className="stat">
                <Calendar className="stat-icon" />
                <div>
                  <span className="stat-number">2024</span>
                  <span className="stat-label">Latest</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Filters */}
        <Section padding="small">
          <MovieFilters
            genres={uniqueGenres}
            selectedGenre={genre}
            onGenreChange={setGenre}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </Section>

        {/* Movies Grid */}
        <Section padding="none">
          <MovieGrid
            movies={filteredResults}
            loading={loading}
            error={error}
            emptyMessage="No trending movies found"
            showDownloadBadge={true}
          />
        </Section>

        {/* Loading State */}
        {loading && (
          <Section padding="large">
            <LoadingSpinner text="Loading trending movies..." />
          </Section>
        )}
      </PageContainer>
    </div>
  )
}

export default Trending
