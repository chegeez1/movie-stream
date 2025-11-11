import React, { createContext, useContext, useReducer, useEffect } from 'react'

const FavoritesContext = createContext()

const initialState = {
  favorites: []
}

function favoritesReducer(state, action) {
  switch (action.type) {
    case 'LOAD_FAVORITES':
      return { ...state, favorites: action.payload }
    
    case 'ADD_FAVORITE':
      if (state.favorites.some(fav => fav.subjectId === action.payload.subjectId)) {
        return state
      }
      return { ...state, favorites: [...state.favorites, action.payload] }
    
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.subjectId !== action.payload)
      }
    
    case 'CLEAR_FAVORITES':
      return { ...state, favorites: [] }
    
    default:
      return state
  }
}

export function FavoritesProvider({ children }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState)

  useEffect(() => {
    const savedFavorites = localStorage.getItem('movieFavorites')
    if (savedFavorites) {
      dispatch({ type: 'LOAD_FAVORITES', payload: JSON.parse(savedFavorites) })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('movieFavorites', JSON.stringify(state.favorites))
  }, [state.favorites])

  const value = {
    favorites: state.favorites,
    addFavorite: (movie) => dispatch({ type: 'ADD_FAVORITE', payload: movie }),
    removeFavorite: (movieId) => dispatch({ type: 'REMOVE_FAVORITE', payload: movieId }),
    clearFavorites: () => dispatch({ type: 'CLEAR_FAVORITES' }),
    isFavorite: (movieId) => state.favorites.some(fav => fav.subjectId === movieId)
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
