import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Filter, Grid, List } from 'lucide-react'
import { useMovieSearch } from '../hooks/useMovies'
import { useApp } from '../context/AppContext'
import MovieGrid from '../components/movies/MovieGrid'
import MovieFilters from '../components/movies/MovieFilters'
import Pagination from '../components/movies/Pagination'
import SearchBar from '../components/common/SearchBar'
import PageContainer from '../components/layout/PageContainer'
import Section from '../components/layout/Section'
import { helpers } from '../utils/helpers'
import '../styles/pages/search.css'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page')) || 1
  
  const [sortBy, setSortBy] = useState('relevance')
  const [genre, setGenre] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const { results, loading, error, hasMore, totalResults } = useMovieSearch(query, page)
  const { addRecentSearch } = useApp()

  // Update URL when search changes
  useEffect(() => {
    if (query) {
      const params = new URLSearchParams()
      params.set('q', query)
      if (page > 1) params.set('page', page.toString())
      setSearchParams(params)
      addRecentSearch(query)
    }
  }, [query, page, setSearchParams, addRecentSearch])

  const handleSearch = (newQuery) => {
    setSearchParams({ q: newQuery })
  }

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', newPage.toString())
      return newParams
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
  }

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre)
  }

  // Filter and sort results
  const filteredResults = helpers.sortMovies(
    helpers.filterMoviesByGenre(results, genre),
    sortBy
  )

  const uniqueGenres = helpers.getUniqueGenres(results)

  return (
    <div className="search-page">
      <PageContainer>
        {/* Search Header */}
        <Section padding="medium">
          <div className="search-header">
            <div className="search-header-content">
              <div className="search-title">
                <SearchIcon size={32} className="search-title-icon" />
                <div>
                  <h1>Search Movies</h1>
                  {query && (
                    <p className="search-results-count">
                      {totalResults > 0 
                        ? `Found ${totalResults} results for "${query}"`
                        : `No results found for "${query}"`
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="search-controls">
                <SearchBar 
                  onSearch={handleSearch}
                  loading={loading}
                  placeholder="Continue searching..."
                  className="search-page-bar"
                />
                
                <button
                  className={`filters-toggle ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} />
                  Filters
                </button>

                <div className="view-mode-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            {(showFilters || uniqueGenres.length > 0) && (
              <div className="search-filters">
                <MovieFilters
                  genres={uniqueGenres}
                  selectedGenre={genre}
                  onGenreChange={handleGenreChange}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  showViewToggle={false}
                />
              </div>
            )}
          </div>
        </Section>

        {/* Search Results */}
        <Section padding="none">
          {query ? (
            <>
              <MovieGrid
                movies={filteredResults}
                loading={loading}
                error={error}
                emptyMessage={`No movies found for "${query}"`}
                showDownloadBadge={true}
              />

              {/* Pagination */}
              {!loading && filteredResults.length > 0 && (
                <div className="search-pagination">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(totalResults / 24)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="search-empty">
              <div className="empty-state">
                <SearchIcon size={64} className="empty-icon" />
                <h2>Start Searching</h2>
                <p>Enter a movie title, actor name, or genre to begin</p>
              </div>
            </div>
          )}
        </Section>
      </PageContainer>
    </div>
  )
}

export default Search
