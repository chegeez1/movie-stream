import React from 'react'
import { Star } from 'lucide-react'
import '../../styles/components/rating.css'

const Rating = ({
  value = 0,
  max = 10,
  size = 'medium',
  showValue = true,
  className = ''
}) => {
  const normalizedValue = (value / max) * 5
  const fullStars = Math.floor(normalizedValue)
  const hasHalfStar = normalizedValue % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={`rating ${size} ${className}`}>
      <div className="stars">
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star
            key={`full-${i}`}
            size={size === 'large' ? 20 : 16}
            className="star full"
            fill="currentColor"
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="star-half-container">
            <Star
              size={size === 'large' ? 20 : 16}
              className="star half"
              fill="currentColor"
            />
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star
            key={`empty-${i}`}
            size={size === 'large' ? 20 : 16}
            className="star empty"
          />
        ))}
      </div>
      
      {showValue && (
        <span className="rating-value">
          {value.toFixed(1)}/{max}
        </span>
      )}
    </div>
  )
}

export default Rating
