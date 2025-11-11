import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Loader } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'
import '../../styles/components/search-bar.css'

const SearchBar = ({ 
  onSearch, 
  loading = false, 
  placeholder = "Search for movies...",
  autoFocus = false,
  onClose 
}) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleClear = () => {
    setQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form className={`search-bar ${isFocused ? 'focused' : ''}`} onSubmit={handleSubmit}>
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search movies"
        />
        
        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
        
        {loading && (
          <div className="search-loader">
            <Loader size={16} className="spinner" />
          </div>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          className="close-search-button"
          onClick={onClose}
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      )}
    </form>
  )
}

export default SearchBar
