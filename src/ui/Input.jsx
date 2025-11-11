import React from 'react'
import { Search, Eye, EyeOff } from 'lucide-react'
import '../../styles/components/input.css'

const Input = ({
  type = 'text',
  size = 'medium',
  variant = 'default', // 'default', 'search'
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false)

  const baseClass = 'input-wrapper'
  const sizeClass = `input-${size}`
  const variantClass = `input-${variant}`
  const errorClass = error ? 'input-error' : ''

  const inputType = type === 'password' && showPassword ? 'text' : type

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={`${baseClass} ${sizeClass} ${variantClass} ${errorClass} ${className}`}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      
      <div className="input-container">
        {variant === 'search' && (
          <Search className="input-icon input-icon-left" size={18} />
        )}
        
        {Icon && variant !== 'search' && (
          <Icon className="input-icon input-icon-left" size={18} />
        )}
        
        <input
          type={inputType}
          className="input-field"
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="input-icon input-icon-right password-toggle"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={`input-message ${error ? 'error' : 'helper'}`}>
          {error || helperText}
        </div>
      )}
    </div>
  )
}

export default Input
