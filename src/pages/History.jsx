import React from 'react'
import { History as HistoryIcon, Trash2, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageContainer from '../components/layout/PageContainer'
import Section from '../components/layout/Section'
import '../styles/pages/history.css'

const History = () => {
  const { recentSearches, clearRecentSearches } = useApp()

  const handleSearch = (query) => {
    // This would navigate to search page with the query
    console.log('Searching for:', query)
  }

  return (
    <div className="history-page">
      <PageContainer>
        {/* Header */}
        <Section padding="medium">
          <div className="history-header">
            <div className="header-content">
              <div className="header-icon">
                <HistoryIcon size={40} />
              </div>
              <div className="header-text">
                <h1>Search History</h1>
                <p>Your recent movie searches</p>
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div className="history-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={clearRecentSearches}
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* Search History */}
        <Section padding="none">
          {recentSearches.length > 0 ? (
            <div className="history-list">
              {recentSearches.map((search, index) => (
                <div key={index} className="history-item">
                  <div className="history-content">
                    <Search size={16} className="history-icon" />
                    <span className="history-query">{search}</span>
                  </div>
                  <button
                    className="history-action"
                    onClick={() => handleSearch(search)}
                  >
                    Search Again
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="history-empty">
              <div className="empty-state">
                <HistoryIcon size={64} className="empty-icon" />
                <h2>No Search History</h2>
                <p>Your recent searches will appear here.</p>
                <div className="empty-actions">
                  <a href="/search" className="btn btn-primary">
                    Start Searching
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

export default History
