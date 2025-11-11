import React from 'react'
import '../../styles/components/badge.css'

const Badge = ({
  children,
  variant = 'default', // 'default', 'primary', 'secondary', 'success', 'warning', 'error'
  size = 'medium', // 'small', 'medium', 'large'
  className = ''
}) => {
  const baseClass = 'badge'
  const variantClass = `badge-${variant}`
  const sizeClass = `badge-${size}`

  return (
    <span className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
