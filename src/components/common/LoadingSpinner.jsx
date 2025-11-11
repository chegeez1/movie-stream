import React from 'react'
import { Loader } from 'lucide-react'
import '../../styles/components/loading-spinner.css'

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...',
  centered = false 
}) => {
  return (
    <div className={`loading-spinner ${size} ${centered ? 'centered' : ''}`}>
      <Loader className="spinner-icon" />
      {text && <span className="loading-text">{text}</span>}
    </div>
  )
}

export const InlineLoader = () => (
  <div className="inline-loader">
    <Loader className="spinner-icon" size={16} />
  </div>
)

export default LoadingSpinner
