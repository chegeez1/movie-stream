import React, { createContext, useContext, useReducer } from 'react'

const DownloadContext = createContext()

const initialState = {
  downloads: [],
  activeDownloads: [],
  completedDownloads: [],
  downloadQueue: []
}

function downloadReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        downloadQueue: [...state.downloadQueue, action.payload]
      }
    
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        downloadQueue: state.downloadQueue.filter(item => item.id !== action.payload)
      }
    
    case 'START_DOWNLOAD':
      return {
        ...state,
        activeDownloads: [...state.activeDownloads, action.payload],
        downloadQueue: state.downloadQueue.filter(item => item.id !== action.payload.id)
      }
    
    case 'UPDATE_DOWNLOAD_PROGRESS':
      return {
        ...state,
        activeDownloads: state.activeDownloads.map(download =>
          download.id === action.payload.id
            ? { ...download, progress: action.payload.progress }
            : download
        )
      }
    
    case 'COMPLETE_DOWNLOAD':
      const completedDownload = state.activeDownloads.find(d => d.id === action.payload)
      return {
        ...state,
        activeDownloads: state.activeDownloads.filter(d => d.id !== action.payload),
        completedDownloads: completedDownload 
          ? [...state.completedDownloads, { ...completedDownload, completedAt: new Date().toISOString() }]
          : state.completedDownloads
      }
    
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        completedDownloads: []
      }
    
    default:
      return state
  }
}

export function DownloadProvider({ children }) {
  const [state, dispatch] = useReducer(downloadReducer, initialState)

  const value = {
    ...state,
    addToQueue: (download) => dispatch({ type: 'ADD_TO_QUEUE', payload: download }),
    removeFromQueue: (id) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id }),
    startDownload: (download) => dispatch({ type: 'START_DOWNLOAD', payload: download }),
    updateDownloadProgress: (id, progress) => dispatch({ 
      type: 'UPDATE_DOWNLOAD_PROGRESS', 
      payload: { id, progress } 
    }),
    completeDownload: (id) => dispatch({ type: 'COMPLETE_DOWNLOAD', payload: id }),
    clearCompleted: () => dispatch({ type: 'CLEAR_COMPLETED' })
  }

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  )
}

export const useDownload = () => {
  const context = useContext(DownloadContext)
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider')
  }
  return context
}
