import React, { useState } from 'react'
import { getSafeImageUrl, getRandomPlaceholder } from '@/utils/imageUtils'
import './SafeImage.scss'

const SafeImage = ({ 
  src, 
  alt = '', 
  className = '', 
  fallback = null,
  category = 'general',
  width = 400,
  height = 300,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(getSafeImageUrl(src, fallback || getRandomPlaceholder(category)))

  const handleError = () => {
    console.warn('Image failed to load:', currentSrc)
    setImageError(true)
    
    // Try fallback image
    if (!imageError) {
      setCurrentSrc(getRandomPlaceholder(category))
    }
  }

  const handleLoad = () => {
    console.log('Image loaded successfully:', currentSrc)
  }

  return (
    <div className={`safe-image-container ${className}`}>
      {!imageError ? (
        <img
          src={currentSrc}
          alt={alt}
          className={`safe-image ${className}`}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      ) : (
        <div className="safe-image-fallback">
          <div className="fallback-content">
            <div className="fallback-icon">📷</div>
            <div className="fallback-text">{alt || 'Image'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SafeImage
