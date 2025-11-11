import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Search, 
  Home, 
  TrendingUp, 
  Download, 
  Heart,
  History,
  Menu, 
  X,
  Moon,
  Sun
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import SearchBar from './SearchBar'
import '../../styles/components/header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { searchQuery, setSearchQuery } = useApp()
  const { theme, toggleTheme, isDark } = useTheme()

  const handleSearch = (query) => {
    setSearchQuery(query)
    navigate('/search')
    setShowSearch(false)
    setIsMenuOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MovieStream</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link 
            to="/trending" 
            className={`nav-link ${isActiveRoute('/trending') ? 'active' : ''}`}
          >
            <TrendingUp size={18} />
            <span>Trending</span>
          </Link>
          <Link 
            to="/favorites" 
            className={`nav-link ${isActiveRoute('/favorites') ? 'active' : ''}`}
          >
            <Heart size={18} />
            <span>Favorites</span>
          </Link>
          <Link 
            to="/downloads" 
            className={`nav-link ${isActiveRoute('/downloads') ? 'active' : ''}`}
          >
            <Download size={18} />
            <span>Downloads</span>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="desktop-actions">
          {/* Search Bar - Desktop */}
          <div className="desktop-search">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="mobile-actions">
          {/* Search Toggle */}
          <button 
            className="mobile-search-toggle"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="mobile-search">
            <SearchBar 
              onSearch={handleSearch} 
              autoFocus 
              onClose={() => setShowSearch(false)}
            />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link 
              to="/trending" 
              className={`nav-link ${isActiveRoute('/trending') ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <TrendingUp size={18} />
              <span>Trending</span>
            </Link>
            <Link 
              to="/favorites" 
              className={`nav-link ${isActiveRoute('/favorites') ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <Heart size={18} />
              <span>Favorites</span>
            </Link>
            <Link 
              to="/downloads" 
              className={`nav-link ${isActiveRoute('/downloads') ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <Download size={18} />
              <span>Downloads</span>
            </Link>
            <Link 
              to="/history" 
              className={`nav-link ${isActiveRoute('/history') ? 'active' : ''}`}
              onClick={toggleMenu}
            >
              <History size={18} />
              <span>History</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
