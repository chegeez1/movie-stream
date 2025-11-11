import React from 'react'
import '../../styles/layout/layout.css'

const Section = ({ 
  children, 
  title,
  subtitle,
  className = '',
  padding = 'medium' // 'none', 'small', 'medium', 'large'
}) => {
  return (
    <section className={`section section-padding-${padding} ${className}`}>
      {(title || subtitle) && (
        <div className="section-header">
          {title && <h2 className="section-title">{title}</h2>}
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </section>
  )
}

export default Section
