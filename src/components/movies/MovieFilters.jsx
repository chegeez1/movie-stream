import React, { useState } from 'react'
import { Filter, SortAsc, Grid, List } from 'lucide-react'
import { GENRES, SORT_OPTIONS } from '../../constants/app'
import '../../styles/components/movie-filters.css'

const MovieFilters = ({
  genres = [],
  selectedGenre = 'all',
  onGenreChange,
  sortBy = 'relevance',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const availableGenres = genres.length > 0 ? genres : GENRES

  return (
    <div className="movie-filters">
      <div className="filters-header">
        <div className="filters-left">
          {/* Genre Filter */}
          <div className="filter-group">
            <label htmlFor="genre-filter" className="filter-label">
              Genre
            </label>
            <select
              id="genre-filter"
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Genres</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre.toLowerCase()}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="filter-group">
            <label htmlFor="sort-filter" className="filter-label">
              <SortAsc size={16} />
              Sort By
            </label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="filter-select"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        {showViewToggle && (
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filters Button */}
      <button
        className="mobile-filters-toggle"
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
      >
        <Filter size={16} />
        Filters
      </button>

      {/* Mobile Filters Panel */}
      {isFiltersOpen && (
        <div className="mobile-filters-panel">
          <div className="filter-group">
            <label>Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => {
                onGenreChange(e.target.value)
                setIsFiltersOpen(false)
              }}
              className="filter-select"
            >
              <option value="all">All Genres</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre.toLowerCase()}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                onSortChange(e.target.value)
                setIsFiltersOpen(false)
              }}
              className="filter-select"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default MovieFilters
