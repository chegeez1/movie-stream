import axios from 'axios'
import { API_CONFIG } from '../../constants/api'

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making API request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API response received from: ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error)
    
    if (error.response) {
      const { status, statusText } = error.response
      throw new Error(`API Error: ${status} - ${statusText}`)
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server')
    } else {
      throw new Error('An unexpected error occurred')
    }
  }
)

export default apiClient
