import { useState, useEffect, useCallback } from 'react'
import { movieAPI } from '../services/api/movieApi'
import { useApp } from '../context/AppContext'

export const useMovieSearch = (query, page = 1) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const { addRecentSearch } = useApp()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setError(null)
      return
    }

    const searchMovies = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await movieAPI.search(query, page)
        
        if (data.status === 200 && data.success) {
          if (page === 1) {
            setResults(data.results.items || [])
            addRecentSearch(query)
          } else {
            setResults(prev => [...prev, ...(data.results.items || [])])
          }
          
          setHasMore(data.results.pager?.hasMore || false)
          setTotalResults(data.results.pager?.totalCount || 0)
        } else {
          setError('No results found')
          setResults([])
        }
      } catch (err) {
        setError(err.message || 'Failed to search movies')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    searchMovies()
  }, [query, page, addRecentSearch])

  return { results, loading, error, hasMore, totalResults }
}

export const useMovieInfo = (movieId) => {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!movieId) return

    const fetchMovieInfo = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await movieAPI.getInfo(movieId)
        
        if (data.status === 200 && data.success) {
          setMovie(data.results)
        } else {
          setError('Movie not found')
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch movie details')
      } finally {
        setLoading(false)
      }
    }

    fetchMovieInfo()
  }, [movieId])

  return { movie, loading, error }
}

export const useDownloadSources = (movieId, season = null, episode = null) => {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSources = useCallback(async () => {
    if (!movieId) return

    setLoading(true)
    setError(null)
    
    try {
      const data = await movieAPI.getSources(movieId, season, episode)
      
      if (data.status === 200 && data.success) {
        setSources(data.results || [])
      } else {
        setError('No download sources available')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch download sources')
    } finally {
      setLoading(false)
    }
  }, [movieId, season, episode])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  return { sources, loading, error, refetch: fetchSources }
}
