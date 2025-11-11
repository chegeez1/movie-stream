import { ROUTES } from './constants/routes'

export const appRoutes = [
  {
    path: ROUTES.HOME,
    component: 'Home',
    exact: true,
    title: 'Home'
  },
  {
    path: ROUTES.SEARCH,
    component: 'Search',
    title: 'Search'
  },
  {
    path: ROUTES.MOVIE_DETAIL,
    component: 'MovieDetail',
    title: 'Movie Details'
  },
  {
    path: ROUTES.TRENDING,
    component: 'Trending',
    title: 'Trending'
  },
  {
    path: ROUTES.DOWNLOADS,
    component: 'Downloads',
    title: 'Downloads'
  },
  {
    path: ROUTES.FAVORITES,
    component: 'Favorites',
    title: 'Favorites'
  },
  {
    path: ROUTES.HISTORY,
    component: 'History',
    title: 'History'
  }
]
