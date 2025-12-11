# Routers Directory

## 📋 Tổng quan
Thư mục chứa cấu hình routing cho ứng dụng React, định nghĩa các route và component tương ứng.

## 📁 Cấu trúc thư mục

### `routers.js`
**Chức năng**: File cấu hình routing chính của ứng dụng

**Tính năng**:
- Lazy loading cho tất cả components
- Route definitions
- Nested routing support
- Route guards (nếu cần)

## 🛣️ Route Configuration

### Route Structure
```javascript
const routers = [
  {
    path: '/route-path',
    component: lazy(() => import('@pages/ComponentName'))
  }
]
```

### Available Routes

#### Public Routes
```javascript
// Trang chủ
{
  path: '/',
  component: lazy(() => import('@pages/Home'))
}

// Tin tức
{
  path: '/news',
  component: lazy(() => import('@pages/News'))
}

// Chi tiết tin tức
{
  path: '/news/:id',
  component: lazy(() => import('@pages/News/Detail'))
}

// Liên hệ
{
  path: '/contacts',
  component: lazy(() => import('@pages/Contacts'))
}

// Giới thiệu
{
  path: '/about',
  component: lazy(() => import('@pages/AboutUs'))
}

// Cửa hàng
{
  path: '/shop',
  component: lazy(() => import('@pages/OurShop'))
}

// Chi tiết sản phẩm
{
  path: '/product/:id',
  component: lazy(() => import('@pages/DetailProduct'))
}
```

#### User Routes
```javascript
// Giỏ hàng
{
  path: '/cart',
  component: lazy(() => import('@pages/Cart'))
}

// Thanh toán
{
  path: '/checkout',
  component: lazy(() => import('@pages/Checkout'))
}

// Đơn hàng
{
  path: '/orders',
  component: lazy(() => import('@pages/Orders'))
}

// Cài đặt tài khoản
{
  path: '/user-settings',
  component: lazy(() => import('@pages/UserSettings'))
}
```

#### Admin/Test Routes
```javascript
// Test settings
{
  path: '/settings-test',
  component: lazy(() => import('@pages/SettingsTest'))
}

// Test user API
{
  path: '/user-test',
  component: lazy(() => import('@pages/UserTest'))
}
```

## 🚀 Lazy Loading

### Implementation
```javascript
import { lazy } from 'react'

// Lazy load component
const HomePage = lazy(() => import('@pages/Home'))

// With loading fallback
const LazyComponent = lazy(() => 
  import('@pages/Component').catch(() => ({
    default: () => <div>Error loading component</div>
  }))
)
```

### Benefits
- **Code Splitting**: Giảm bundle size ban đầu
- **Performance**: Load component khi cần thiết
- **Memory**: Tiết kiệm memory
- **Loading**: Cải thiện thời gian load trang

## 🔧 Route Configuration

### Basic Route
```javascript
{
  path: '/path',
  component: lazy(() => import('@pages/Component'))
}
```

### Route with Parameters
```javascript
{
  path: '/product/:id',
  component: lazy(() => import('@pages/ProductDetail'))
}
```

### Nested Routes
```javascript
{
  path: '/admin',
  component: lazy(() => import('@pages/Admin')),
  children: [
    {
      path: 'users',
      component: lazy(() => import('@pages/Admin/Users'))
    },
    {
      path: 'products',
      component: lazy(() => import('@pages/Admin/Products'))
    }
  ]
}
```

## 🎯 Usage Examples

### App.jsx Setup
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import routers from './routers/routers'

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routers.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### Navigation
```javascript
import { Link, useNavigate } from 'react-router-dom'

// Link component
<Link to="/news">Tin tức</Link>

// Programmatic navigation
const navigate = useNavigate()
navigate('/user-settings')
```

### Route Parameters
```javascript
import { useParams } from 'react-router-dom'

function ProductDetail() {
  const { id } = useParams()
  
  return <div>Product ID: {id}</div>
}
```

## 🔒 Route Guards

### Authentication Guard
```javascript
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}

// Usage
{
  path: '/user-settings',
  element: (
    <ProtectedRoute>
      <UserSettings />
    </ProtectedRoute>
  )
}
```

### Role-based Guard
```javascript
const AdminRoute = ({ children }) => {
  const user = useSelector(state => state.auth.user)
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" />
  }
  
  return children
}
```

## 📱 Mobile Considerations

### Touch Navigation
```javascript
// Mobile-friendly navigation
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="mobile-nav">
      <button onClick={() => setIsOpen(!isOpen)}>
        Menu
      </button>
      {isOpen && (
        <nav>
          <Link to="/news" onClick={() => setIsOpen(false)}>
            Tin tức
          </Link>
          <Link to="/contacts" onClick={() => setIsOpen(false)}>
            Liên hệ
          </Link>
        </nav>
      )}
    </div>
  )
}
```

## 🚀 Performance Optimization

### Route-based Code Splitting
```javascript
// Chia nhỏ routes theo feature
const newsRoutes = [
  {
    path: '/news',
    component: lazy(() => import('@pages/News'))
  },
  {
    path: '/news/:id',
    component: lazy(() => import('@pages/News/Detail'))
  }
]

const userRoutes = [
  {
    path: '/user-settings',
    component: lazy(() => import('@pages/UserSettings'))
  },
  {
    path: '/orders',
    component: lazy(() => import('@pages/Orders'))
  }
]
```

### Preloading
```javascript
// Preload component khi hover
const LazyComponent = lazy(() => import('@pages/Component'))

const PreloadLink = ({ to, children }) => {
  const handleMouseEnter = () => {
    // Preload component
    import('@pages/Component')
  }
  
  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  )
}
```

## 🧪 Testing Routes

### Route Testing
```javascript
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

test('renders home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
  
  expect(screen.getByText('Home')).toBeInTheDocument()
})
```

### Navigation Testing
```javascript
import { fireEvent } from '@testing-library/react'

test('navigates to news page', () => {
  render(<App />)
  
  fireEvent.click(screen.getByText('Tin tức'))
  
  expect(screen.getByText('News Page')).toBeInTheDocument()
})
```

## 📚 Best Practices

### Route Organization
- Nhóm routes theo feature
- Sử dụng constants cho route paths
- Implement route guards khi cần
- Optimize lazy loading

### Performance
- Preload critical routes
- Use route-based code splitting
- Implement proper error boundaries
- Monitor bundle sizes

### Security
- Protect sensitive routes
- Validate route parameters
- Implement proper redirects
- Handle unauthorized access
