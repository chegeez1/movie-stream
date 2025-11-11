import React from 'react'
import { Loader } from 'lucide-react'
import '../../styles/components/buttons.css'

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = `btn-${size}`
  const loadingClass = loading ? 'btn-loading' : ''
  const disabledClass = disabled ? 'btn-disabled' : ''

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader className="btn-spinner" size={16} />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={16} className="btn-icon-left" />
      )}
      
      <span className="btn-text">{children}</span>
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={16} className="btn-icon-right" />
      )}
    </button>
  )
}

export const IconButton = ({
  icon: Icon,
  size = 'medium',
  variant = 'ghost',
  label,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      icon={Icon}
      iconPosition="center"
      aria-label={label}
      {...props}
    >
      {/* Empty children for icon-only button */}
    </Button>
  )
}

export default Button
