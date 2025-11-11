import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/components/tooltip.css'

const Tooltip = ({
  content,
  children,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  delay = 200,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  let timeoutId

  const showTooltip = () => {
    timeoutId = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    clearTimeout(timeoutId)
    setIsVisible(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className={`tooltip tooltip-${position} ${className}`}
            style={{
              left: coords.x,
              top: coords.y
            }}
          >
            <div className="tooltip-content">
              {content}
            </div>
            <div className="tooltip-arrow" />
          </div>,
          document.body
        )}
    </>
  )
}

export default Tooltip
