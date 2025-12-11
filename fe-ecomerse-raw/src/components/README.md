# Components Directory

## 📋 Tổng quan
Thư mục chứa các React components tái sử dụng trong toàn bộ ứng dụng.

## 📁 Cấu trúc thư mục

### `/Header/`
**Chức năng**: Header và navigation chính của ứng dụng
- **Header.jsx** - Component header chính
- **constants.js** - Constants cho navigation menu
- **Header.scss** - Styles cho header

**Tính năng**:
- Logo và branding
- Navigation menu
- User authentication status
- Shopping cart icon
- Mobile responsive menu

### `/Footer/`
**Chức năng**: Footer của trang web
- **Footer.jsx** - Component footer chính
- **Footer.scss** - Styles cho footer

**Tính năng**:
- Company information
- Quick links
- Social media links
- Contact information
- Copyright notice

### `/Layout/`
**Chức năng**: Layout chính của ứng dụng
- **Layout.jsx** - Main layout component
- **Layout.scss** - Styles cho layout

**Tính năng**:
- Wrapper cho toàn bộ ứng dụng
- Header + Main content + Footer structure
- Responsive layout
- Common styling

### `/SafeImage/`
**Chức năng**: Component xử lý ảnh an toàn
- **SafeImage.jsx** - Component chính
- **SafeImage.scss** - Styles cho image

**Tính năng**:
- Error handling cho ảnh
- Fallback images
- Loading states
- Placeholder images
- Responsive image sizing

## 🎯 Sử dụng

### Header Component
```jsx
import MyHeader from '@components/Header/Header'

function App() {
  return (
    <div>
      <MyHeader />
      {/* Your content */}
    </div>
  )
}
```

### SafeImage Component
```jsx
import SafeImage from '@components/SafeImage/SafeImage'

function ProductCard() {
  return (
    <SafeImage
      src={product.image}
      alt={product.name}
      category="product"
      fallback={getRandomPlaceholder('product')}
    />
  )
}
```

## 🎨 Styling
- Sử dụng SCSS cho styling
- BEM methodology cho CSS class naming
- Responsive design với mobile-first approach
- CSS variables cho theming

## 🔧 Props Interface

### Header Props
```typescript
interface HeaderProps {
  isAuthenticated?: boolean
  user?: User
  cartCount?: number
}
```

### SafeImage Props
```typescript
interface SafeImageProps {
  src: string
  alt: string
  className?: string
  category?: 'product' | 'user' | 'news'
  fallback?: string
  width?: number
  height?: number
}
```

## 📱 Responsive Design
Tất cả components đều được thiết kế responsive:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🚀 Performance
- Lazy loading cho images
- Memoization cho expensive operations
- Optimized re-renders
- Code splitting ready
