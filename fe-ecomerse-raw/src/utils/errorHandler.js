// Global error handler for images and other resources

// Track failed image URLs to avoid retrying
const failedImages = new Set()

// Handle image loading errors globally
export const handleImageError = (event) => {
  const img = event.target
  const src = img.src
  
  console.warn('Image failed to load:', src)
  
  // Add to failed images set
  failedImages.add(src)
  
  // Try to load a fallback image
  if (!img.dataset.fallbackAttempted) {
    img.dataset.fallbackAttempted = 'true'
    
    // Use a reliable placeholder service
    const fallbackUrl = getFallbackImageUrl()
    img.src = fallbackUrl
  } else {
    // If fallback also failed, hide the image and show placeholder
    img.style.display = 'none'
    
    // Show placeholder if it exists
    const placeholder = img.nextElementSibling
    if (placeholder && placeholder.classList.contains('image-placeholder')) {
      placeholder.style.display = 'flex'
    }
  }
}

// Get a reliable fallback image URL
export const getFallbackImageUrl = () => {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop',
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2'
  ]
  
  return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
}

// Check if an image URL has previously failed
export const hasImageFailed = (url) => {
  return failedImages.has(url)
}

// Clear failed images cache
export const clearFailedImages = () => {
  failedImages.clear()
}

// Setup global image error handling
export const setupGlobalImageErrorHandling = () => {
  // Add global error listener for images
  document.addEventListener('error', (event) => {
    if (event.target.tagName === 'IMG') {
      handleImageError(event)
    }
  }, true)
  
  console.log('Global image error handling setup complete')
}

// Initialize error handling when the module loads
if (typeof window !== 'undefined') {
  setupGlobalImageErrorHandling()
}
