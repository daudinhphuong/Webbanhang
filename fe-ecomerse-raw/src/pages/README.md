# Pages Directory

## 📋 Tổng quan
Thư mục chứa các trang chính của ứng dụng e-commerce.

## 📁 Cấu trúc thư mục

### `/News/`
**Chức năng**: Quản lý tin tức và bài viết
- **index.jsx** - Trang danh sách tin tức
- **Detail.jsx** - Trang chi tiết bài viết
- **News.scss** - Styles cho danh sách tin tức
- **NewsDetail.scss** - Styles cho chi tiết bài viết

**Tính năng**:
- Hiển thị danh sách tin tức
- Phân trang
- Tìm kiếm và lọc
- Chi tiết bài viết với HTML content
- Image gallery
- Related articles
- Responsive design

### `/Contacts/`
**Chức năng**: Trang liên hệ và thông tin cửa hàng
- **index.jsx** - Trang liên hệ chính
- **Contacts.scss** - Styles cho trang liên hệ

**Tính năng**:
- Thông tin liên hệ từ Shop Settings
- Form liên hệ
- Bản đồ cửa hàng
- Social media links
- Working hours
- Contact information cards

### `/UserSettings/`
**Chức năng**: Cài đặt tài khoản người dùng
- **index.jsx** - Trang cài đặt chính
- **UserSettings.scss** - Styles cho trang cài đặt

**Tính năng**:
- Hiển thị thông tin cá nhân (read-only)
- Thay đổi mật khẩu
- Upload avatar
- Tab navigation
- Form validation
- Security settings

### `/AboutUs/`
**Chức năng**: Trang giới thiệu về công ty
- **index.jsx** - Trang giới thiệu chính
- **styles.module.scss** - Styles cho trang giới thiệu
- **components/Logos.jsx** - Component hiển thị logos

**Tính năng**:
- Company information
- Team members
- Company values
- Logo partners
- Image gallery

### `/OurShop/`
**Chức năng**: Trang cửa hàng và sản phẩm
- **OurShop.jsx** - Trang cửa hàng chính
- **components/** - Các component con
- **styles.module.scss** - Styles cho trang cửa hàng

**Tính năng**:
- Product listing
- Filter và search
- Product categories
- Pagination
- Product cards
- Shopping cart integration

### `/Cart/`
**Chức năng**: Giỏ hàng và checkout
- **Cart.jsx** - Trang giỏ hàng chính
- **components/** - Các component checkout
- **styles.module.scss** - Styles cho giỏ hàng

**Tính năng**:
- Shopping cart management
- Quantity adjustment
- Price calculation
- Checkout process
- Payment integration
- Order summary

### `/Checkout/`
**Chức năng**: Trang thanh toán
- **index.jsx** - Trang checkout chính

**Tính năng**:
- Payment forms
- Shipping information
- Order confirmation
- Payment methods
- Billing address

### `/Orders/`
**Chức năng**: Quản lý đơn hàng
- **index.jsx** - Trang đơn hàng chính

**Tính năng**:
- Order history
- Order status tracking
- Order details
- Reorder functionality
- Order search

## 🎯 Routing

### Route Configuration
```javascript
// Trong routers.js
{
  path: '/news',
  component: lazy(() => import('@pages/News'))
},
{
  path: '/contacts',
  component: lazy(() => import('@pages/Contacts'))
},
{
  path: '/user-settings',
  component: lazy(() => import('@pages/UserSettings'))
}
```

## 🎨 Styling Patterns

### SCSS Structure
```scss
.page-name {
  // Main container styles
  
  .page-header {
    // Header styles
  }
  
  .page-content {
    // Content styles
  }
  
  .page-footer {
    // Footer styles
  }
}
```

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1200px
- Flexible grid system
- Touch-friendly interfaces

## 🔧 Component Patterns

### Page Structure
```jsx
function PageName() {
  return (
    <>
      <MyHeader />
      <MainLayout>
        <div className="page-container">
          {/* Page content */}
        </div>
      </MainLayout>
      <MyFooter />
    </>
  )
}
```

### State Management
- Local state với useState
- API calls với useEffect
- Error handling
- Loading states

## 📱 Mobile Optimization
- Touch-friendly buttons
- Swipe gestures
- Optimized images
- Fast loading
- Offline support

## 🚀 Performance
- Lazy loading cho routes
- Image optimization
- Code splitting
- Memoization
- Bundle optimization
