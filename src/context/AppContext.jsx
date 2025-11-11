import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const initialState = {
  searchQuery: '',
  recentSearches: [],
  isLoading: false,
  error: null,
  userPreferences: {
    defaultQuality: '720p',
    autoPlayTrailers: true,
    showAdultContent: false
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'ADD_RECENT_SEARCH':
      const newSearches = [
        action.payload,
        ...state.recentSearches.filter(s => s !== action.payload)
      ].slice(0, 10)
      return { ...state, recentSearches: newSearches }
    
    case 'CLEAR_RECENT_SEARCHES':
      return { ...state, recentSearches: [] }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload }
      }
    
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    const savedState = localStorage.getItem('appState')
    return savedState ? { ...initialState, ...JSON.parse(savedState) } : initialState
  })

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify({
      recentSearches: state.recentSearches,
      userPreferences: state.userPreferences
    }))
  }, [state.recentSearches, state.userPreferences])

  const value = {
    ...state,
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    addRecentSearch: (query) => dispatch({ type: 'ADD_RECENT_SEARCH', payload: query }),
    clearRecentSearches: () => dispatch({ type: 'CLEAR_RECENT_SEARCHES' }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    updatePreferences: (preferences) => dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
