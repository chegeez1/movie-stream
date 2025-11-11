import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, TrendingUp, Star, Download } from 'lucide-react'
import { useMovieSearch } from '../hooks/useMovies'
import { useDebounce } from '../hooks/useDebounce'
import { useApp } from '../context/AppContext'
import MovieGrid from '../components/movies/MovieGrid'
import SearchBar from '../components/common/SearchBar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import PageContainer from '../components/layout/PageContainer'
import Section from '../components/layout/Section'
import '../styles/pages/home.css'

const Home = () => {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 500)
  const { results, loading, error } = useMovieSearch(debouncedSearch)
  const { recentSearches, addRecentSearch } = useApp()

  const handleSearch = (query) => {
    setSearchInput(query)
    if (query.trim()) {
      addRecentSearch(query)
    }
  }

  const clearSearch = () => {
    setSearchInput('')
  }

  const featuredSearches = [
    'Avengers',
    'Spider Man',
    'John Wick',
    'Transformers',
    'Fast and Furious',
    'The Matrix'
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <PageContainer>
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Discover & Download
                <span className="highlight"> Movies</span>
              </h1>
              <p className="hero-subtitle">
                Stream trailers and download your favorite movies in high quality. 
                Search through thousands of titles from various genres.
              </p>
              
              <div className="hero-search">
                <SearchBar 
                  onSearch={handleSearch}
                  loading={loading}
                  placeholder="Search for movies, TV shows, actors..."
                  autoFocus
                />
              </div>

              <div className="hero-features">
                <div className="feature">
                  <Play className="feature-icon" />
                  <span>Stream Trailers</span>
                </div>
                <div className="feature">
                  <Download className="feature-icon" />
                  <span>HD Downloads</span>
                </div>
                <div className="feature">
                  <Star className="feature-icon" />
                  <span>IMDb Ratings</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="movie-showcase">
                <div className="showcase-item showcase-main">
                  <div className="showcase-poster"></div>
                </div>
                <div className="showcase-item showcase-secondary">
                  <div className="showcase-poster"></div>
                </div>
                <div className="showcase-item showcase-tertiary">
                  <div className="showcase-poster"></div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Search Results */}
      {debouncedSearch && (
        <Section padding="large">
          <PageContainer>
            <div className="section-header">
              <h2>Search Results for "{debouncedSearch}"</h2>
              <button onClick={clearSearch} className="clear-search-btn">
                Clear Search
              </button>
            </div>
            
            {loading && <LoadingSpinner text="Searching movies..." />}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && (
              <MovieGrid 
                movies={results} 
                showDownloadBadge={true}
              />
            )}
          </PageContainer>
        </Section>
      )}

      {/* Recent Searches */}
      {!debouncedSearch && recentSearches.length > 0 && (
        <Section padding="medium">
          <PageContainer>
            <div className="section-header">
              <h2>Recent Searches</h2>
            </div>
            <div className="recent-searches">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="recent-search-tag"
                >
                  {search}
                </button>
              ))}
            </div>
          </PageContainer>
        </Section>
      )}

      {/* Featured Searches */}
      {!debouncedSearch && (
        <Section padding="medium">
          <PageContainer>
            <div className="section-header">
              <h2>Popular Searches</h2>
              <p>Discover trending movies and popular titles</p>
            </div>
            <div className="featured-searches">
              {featuredSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="featured-search-card"
                >
                  <span className="search-text">{search}</span>
                  <TrendingUp size={16} />
                </button>
              ))}
            </div>
          </PageContainer>
        </Section>
      )}

      {/* Quick Actions */}
      {!debouncedSearch && (
        <Section padding="large" className="quick-actions-section">
          <PageContainer>
            <div className="quick-actions">
              <Link to="/trending" className="action-card">
                <div className="action-icon">
                  <TrendingUp size={32} />
                </div>
                <h3>Trending Movies</h3>
                <p>Discover what's popular right now</p>
                <span className="action-link">Browse Trending →</span>
              </Link>

              <Link to="/downloads" className="action-card">
                <div className="action-icon">
                  <Download size={32} />
                </div>
                <h3>Download Manager</h3>
                <p>Manage your downloads and queue</p>
                <span className="action-link">View Downloads →</span>
              </Link>

              <div className="action-card">
                <div className="action-icon">
                  <Star size={32} />
                </div>
                <h3>Your Favorites</h3>
                <p>Access your saved movies quickly</p>
                <Link to="/favorites" className="action-link">
                  View Favorites →
                </Link>
              </div>
            </div>
          </PageContainer>
        </Section>
      )}
    </div>
  )
}

export default Home
