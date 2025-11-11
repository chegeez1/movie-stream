import React from 'react'
import '../../styles/components/card.css'

const Card = ({
  children,
  variant = 'default', // 'default', 'outline', 'filled'
  padding = 'medium', // 'none', 'small', 'medium', 'large'
  className = '',
  ...props
}) => {
  const baseClass = 'card'
  const variantClass = `card-${variant}`
  const paddingClass = `card-padding-${padding}`

  return (
    <div
      className={`${baseClass} ${variantClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
)

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
)

export default Card
