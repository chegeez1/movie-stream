import React from 'react'
import { Heart, Trash2, Download } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import MovieGrid from '../components/movies/MovieGrid'
import PageContainer from '../components/layout/PageContainer'
import Section from '../components/layout/Section'
import '../styles/pages/favorites.css'

const Favorites = () => {
  const { favorites, clearFavorites } = useFavorites()

  return (
    <div className="favorites-page">
      <PageContainer>
        {/* Header */}
        <Section padding="medium">
          <div className="favorites-header">
            <div className="header-content">
              <div className="header-icon">
                <Heart size={40} />
              </div>
              <div className="header-text">
                <h1>Your Favorites</h1>
                <p>Movies you've added to your favorites list</p>
              </div>
            </div>

            {favorites.length > 0 && (
              <div className="favorites-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={clearFavorites}
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="favorites-stats">
            <div className="stat">
              <Heart className="stat-icon" />
              <div>
                <span className="stat-number">{favorites.length}</span>
                <span className="stat-label">Favorites</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Favorites Grid */}
        <Section padding="none">
          {favorites.length > 0 ? (
            <MovieGrid
              movies={favorites}
              showDownloadBadge={true}
              emptyMessage="No favorites yet"
            />
          ) : (
            <div className="favorites-empty">
              <div className="empty-state">
                <Heart size={64} className="empty-icon" />
                <h2>No Favorites Yet</h2>
                <p>Start adding movies to your favorites by clicking the heart icon on any movie card.</p>
                <div className="empty-actions">
                  <a href="/" className="btn btn-primary">
                    Browse Movies
                  </a>
                </div>
              </div>
            </div>
          )}
        </Section>
      </PageContainer>
    </div>
  )
}

export default Favorites
