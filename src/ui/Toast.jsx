import React from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import '../../styles/components/toast.css'

const Toast = ({
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  onClose,
  duration = 5000,
  position = 'bottom-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="toast-icon success" />
      case 'error':
        return <AlertCircle size={20} className="toast-icon error" />
      case 'warning':
        return <AlertTriangle size={20} className="toast-icon warning" />
      case 'info':
      default:
        return <Info size={20} className="toast-icon info" />
    }
  }

  return (
    <div className={`toast toast-${type} toast-${position}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast
