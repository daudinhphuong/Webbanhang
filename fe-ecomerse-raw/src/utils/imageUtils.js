// Image utility functions for handling placeholder images and fallbacks

// Default placeholder images that are reliable
export const PLACEHOLDER_IMAGES = {
  // Using reliable placeholder services
  PICSUM: 'https://picsum.photos/400/300',
  UNSPLASH: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  LOREM_PIXEL: 'https://picsum.photos/400/300?random=1',
  
  // Local fallback (base64 encoded simple image)
  LOCAL_FALLBACK: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTE5NSAxNDVIMjA1VjE1NUgxOTVWMjA1SDIwNVYyMTVIMTk1VjE0NVoiIGZpbGw9IiNEOUQ5RDkiLz4KPC9zdmc+',
  
  // Fashion/tech themed placeholders
  FASHION: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format',
  TECH: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&auto=format',
  SHOP: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&auto=format'
}

// Generate a random placeholder image
export const getRandomPlaceholder = (category = 'general') => {
  const placeholders = {
    fashion: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop'
    ],
    tech: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    general: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
      'https://picsum.photos/400/300?random=3'
    ]
  }
  
  const categoryPlaceholders = placeholders[category] || placeholders.general
  return categoryPlaceholders[Math.floor(Math.random() * categoryPlaceholders.length)]
}

// Check if an image URL is valid and accessible
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  
  // Check for common invalid patterns
  const invalidPatterns = [
    /^$/, // Empty string
    /^undefined$/i,
    /^null$/i,
    /^#+$/, // Just hash symbols
    /via\.placeholder\.com/ // Known problematic service
  ]
  
  return !invalidPatterns.some(pattern => pattern.test(url))
}

// Get a safe image URL with fallback
export const getSafeImageUrl = (url, fallback = PLACEHOLDER_IMAGES.LOCAL_FALLBACK) => {
  if (!isValidImageUrl(url)) {
    return fallback
  }
  
  // If it's a relative URL, make it absolute
  if (url.startsWith('//')) {
    return 'https:' + url
  }
  
  if (url.startsWith('/')) {
    return window.location.origin + url
  }
  
  return url
}

// Create an image with error handling
export const createImageWithFallback = (src, alt = '', className = '', onError = null) => {
  const img = new Image()
  img.src = getSafeImageUrl(src)
  img.alt = alt
  img.className = className
  
  img.onerror = (e) => {
    console.warn('Image failed to load:', src)
    if (onError) {
      onError(e)
    } else {
      // Default fallback behavior
      e.target.src = PLACEHOLDER_IMAGES.LOCAL_FALLBACK
    }
  }
  
  return img
}

// Extract image from HTML content
export const extractImageFromContent = (content) => {
  if (!content || typeof content !== 'string') return null
  
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/)
  if (imgMatch && imgMatch[1]) {
    return getSafeImageUrl(imgMatch[1])
  }
  
  return null
}

// Generate a placeholder image with text
export const generatePlaceholderImage = (text = 'Image', width = 400, height = 300, bgColor = '#f5f5f5', textColor = '#999') => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  // Background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)
  
  // Text
  ctx.fillStyle = textColor
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
  
  return canvas.toDataURL()
}
