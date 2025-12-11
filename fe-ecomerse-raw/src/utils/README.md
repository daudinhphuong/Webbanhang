# Utils Directory

## 📋 Tổng quan
Thư mục chứa các utility functions và helpers được sử dụng trong toàn bộ ứng dụng.

## 📁 Cấu trúc thư mục

### `imageUtils.js`
**Chức năng**: Xử lý ảnh và placeholder images

**Tính năng**:
- Safe image URL handling
- Fallback image management
- Image error recovery
- Placeholder generation
- Content image extraction

**Exports**:
```javascript
// Constants
PLACEHOLDER_IMAGES - Các ảnh placeholder mặc định
getRandomPlaceholder(category) - Lấy ảnh placeholder ngẫu nhiên
isValidImageUrl(url) - Kiểm tra URL ảnh hợp lệ
getSafeImageUrl(url, fallback) - Lấy URL ảnh an toàn
createImageWithFallback(src, alt, className, onError) - Tạo ảnh với fallback
extractImageFromContent(content) - Trích xuất ảnh từ HTML content
generatePlaceholderImage(text, width, height, bgColor, textColor) - Tạo ảnh placeholder
```

**Sử dụng**:
```javascript
import { getSafeImageUrl, getRandomPlaceholder } from '@/utils/imageUtils'

// Sử dụng ảnh an toàn
const safeImageUrl = getSafeImageUrl(imageUrl, getRandomPlaceholder('fashion'))

// Tạo placeholder
const placeholder = generatePlaceholderImage('No Image', 400, 300)
```

### `errorHandler.js`
**Chức năng**: Xử lý lỗi toàn cục cho ứng dụng

**Tính năng**:
- Global error handling
- Image error recovery
- Failed image tracking
- Retry mechanisms
- Fallback strategies

**Exports**:
```javascript
handleImageError(event) - Xử lý lỗi ảnh
getFallbackImageUrl() - Lấy URL ảnh fallback
hasImageFailed(url) - Kiểm tra ảnh đã lỗi
clearFailedImages() - Xóa cache ảnh lỗi
setupGlobalImageErrorHandling() - Setup global error handling
```

**Sử dụng**:
```javascript
import '@/utils/errorHandler' // Auto-setup global handling

// Manual error handling
if (hasImageFailed(imageUrl)) {
  // Use fallback
  imageUrl = getFallbackImageUrl()
}
```

## 🎯 Use Cases

### Image Handling
```javascript
// Safe image loading
const SafeImage = ({ src, alt, fallback }) => {
  const safeSrc = getSafeImageUrl(src, fallback)
  
  return (
    <img
      src={safeSrc}
      alt={alt}
      onError={(e) => {
        e.target.src = getRandomPlaceholder('general')
      }}
    />
  )
}
```

### Content Processing
```javascript
// Extract image from HTML content
const extractFirstImage = (htmlContent) => {
  return extractImageFromContent(htmlContent)
}

// Clean HTML content
const cleanContent = (htmlContent) => {
  return htmlContent
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}
```

### Error Recovery
```javascript
// Global error setup
import '@/utils/errorHandler'

// Manual error handling
const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login'
  }
}
```

## 🔧 Configuration

### Placeholder Images
```javascript
// Custom placeholder sources
const PLACEHOLDER_IMAGES = {
  PICSUM: 'https://picsum.photos/400/300',
  UNSPLASH: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  FASHION: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  TECH: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
}
```

### Error Handling Setup
```javascript
// Auto-setup khi import
if (typeof window !== 'undefined') {
  setupGlobalImageErrorHandling()
}
```

## 🚀 Performance

### Image Optimization
- Lazy loading support
- WebP format preference
- Responsive image sizing
- Caching strategies

### Error Recovery
- Failed image tracking
- Retry mechanisms
- Fallback chains
- Performance monitoring

## 📱 Mobile Support
- Touch-friendly error handling
- Offline image fallbacks
- Network-aware loading
- Battery optimization

## 🔒 Security
- URL validation
- XSS prevention
- Content sanitization
- Safe image sources

## 🧪 Testing
```javascript
// Test image utilities
describe('imageUtils', () => {
  test('should validate image URLs', () => {
    expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true)
    expect(isValidImageUrl('invalid-url')).toBe(false)
  })
  
  test('should generate safe URLs', () => {
    const safeUrl = getSafeImageUrl('invalid', 'fallback.jpg')
    expect(safeUrl).toBe('fallback.jpg')
  })
})
```

## 📚 Examples

### Complete Image Component
```javascript
import { getSafeImageUrl, getRandomPlaceholder } from '@/utils/imageUtils'

const ProductImage = ({ src, alt, category = 'product' }) => {
  const [imageError, setImageError] = useState(false)
  const safeSrc = getSafeImageUrl(src, getRandomPlaceholder(category))
  
  const handleError = () => {
    setImageError(true)
  }
  
  if (imageError) {
    return <div className="image-placeholder">No Image</div>
  }
  
  return (
    <img
      src={safeSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
    />
  )
}
```
