import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Search, Film } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import Section from '../components/layout/Section'
import '../styles/pages/not-found.css'

const NotFound = () => {
  return (
    <div className="not-found-page">
      <PageContainer>
        <Section padding="large">
          <div className="not-found-content">
            <div className="not-found-illustration">
              <div className="error-code">404</div>
              <Film size={120} className="film-icon" />
            </div>
            
            <div className="not-found-text">
              <h1>Page Not Found</h1>
              <p>
                The movie you're looking for seems to have left the theater. 
                Don't worry, there are plenty of other great movies to discover!
              </p>
            </div>

            <div className="not-found-actions">
              <Link to="/" className="btn btn-primary">
                <Home size={16} />
                Go Home
              </Link>
              <Link to="/search" className="btn btn-secondary">
                <Search size={16} />
                Search Movies
              </Link>
              <Link to="/trending" className="btn btn-outline">
                <Film size={16} />
                Browse Trending
              </Link>
            </div>
          </div>
        </Section>
      </PageContainer>
    </div>
  )
}

export default NotFound
