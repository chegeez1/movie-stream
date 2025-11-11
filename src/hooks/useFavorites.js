import { useFavorites as useFavoritesContext } from '../context/FavoritesContext'

export const useFavorites = () => {
  const { favorites, addFavorite, removeFavorite, clearFavorites, isFavorite } = useFavoritesContext()

  const toggleFavorite = (movie) => {
    if (isFavorite(movie.subjectId)) {
      removeFavorite(movie.subjectId)
    } else {
      addFavorite(movie)
    }
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    clearFavorites,
    isFavorite,
    toggleFavorite
  }
}
