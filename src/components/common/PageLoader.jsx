import React from 'react'
import LoadingSpinner from './LoadingSpinner'
import '../../styles/components/page-loader.css'

const PageLoader = ({ message = "Loading content..." }) => {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <LoadingSpinner size="large" text={message} centered />
      </div>
    </div>
  )
}

export const SkeletonLoader = ({ count = 1 }) => {
  return (
    <div className="skeleton-loader">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-poster"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-meta"></div>
            <div className="skeleton-description"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PageLoader
