import { ENDPOINTS } from '../../constants/api'

export const buildEndpoint = (endpoint, params = {}) => {
  let url = endpoint
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    if (url.includes(`:${key}`)) {
      url = url.replace(`:${key}`, params[key])
    }
  })
  
  return url
}

export const getSearchEndpoint = (query) => 
  `${ENDPOINTS.SEARCH}/${encodeURIComponent(query)}`

export const getMovieInfoEndpoint = (id) => 
  `${ENDPOINTS.MOVIE_INFO}/${id}`

export const getDownloadSourcesEndpoint = (id, season = null, episode = null) => {
  let url = `${ENDPOINTS.DOWNLOAD_SOURCES}/${id}`
  const params = new URLSearchParams()
  
  if (season) params.append('season', season)
  if (episode) params.append('episode', episode)
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }
  
  return url
}
