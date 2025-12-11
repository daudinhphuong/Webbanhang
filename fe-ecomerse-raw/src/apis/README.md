# APIs Directory

## 📋 Tổng quan
Thư mục chứa các service API để giao tiếp với backend server.

## 📁 Cấu trúc thư mục

### `axiosClient.js`
**Chức năng**: Cấu hình Axios client chung cho toàn bộ ứng dụng

**Tính năng**:
- Base URL configuration
- Request/Response interceptors
- Error handling
- Authentication headers
- Timeout settings

**Sử dụng**:
```javascript
import axiosClient from './axiosClient'

// GET request
const response = await axiosClient.get('/endpoint')

// POST request
const response = await axiosClient.post('/endpoint', data)
```

### `newsService.js`
**Chức năng**: API service cho tin tức và bài viết

**Endpoints**:
- `getNews()` - Lấy danh sách tin tức
- `getNewsById(id)` - Lấy chi tiết bài viết
- `createNews(data)` - Tạo bài viết mới (Admin)
- `updateNews(id, data)` - Cập nhật bài viết (Admin)
- `deleteNews(id)` - Xóa bài viết (Admin)

**Sử dụng**:
```javascript
import { getNews, getNewsById } from '@/apis/newsService'

// Lấy danh sách tin tức
const news = await getNews()

// Lấy chi tiết bài viết
const article = await getNewsById('article-id')
```

### `userService.js`
**Chức năng**: API service cho quản lý người dùng

**Endpoints**:
- `getUserProfile()` - Lấy thông tin profile
- `updateUserProfile(data)` - Cập nhật thông tin profile
- `changePassword(data)` - Đổi mật khẩu
- `uploadAvatar(file)` - Upload avatar
- `getUserOrders()` - Lấy đơn hàng của user

**Sử dụng**:
```javascript
import { getUserProfile, updateUserProfile } from '@/apis/userService'

// Lấy thông tin user
const profile = await getUserProfile()

// Cập nhật thông tin
await updateUserProfile({
  firstName: 'Hùng',
  lastName: 'Nguyễn'
})
```

### `settingsService.js`
**Chức năng**: API service cho cài đặt hệ thống

**Endpoints**:
- `getShopSettings()` - Lấy cài đặt cửa hàng
- `updateShopSettings(data)` - Cập nhật cài đặt (Admin)
- `getContactInfo()` - Lấy thông tin liên hệ

**Sử dụng**:
```javascript
import { getShopSettings } from '@/apis/settingsService'

// Lấy cài đặt cửa hàng
const settings = await getShopSettings()
```

## 🔧 API Configuration

### Base Configuration
```javascript
// axiosClient.js
const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Authentication
```javascript
// Thêm token vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Error Handling
```javascript
// Xử lý lỗi toàn cục
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 📊 Data Models

### News Model
```javascript
{
  _id: string,
  title: string,
  content: string,
  description: string,
  image: string,
  thumbnail: string,
  images: string[],
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model
```javascript
{
  _id: string,
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  address: string,
  dateOfBirth: string,
  gender: string,
  avatar: string,
  role: string,
  isActive: boolean
}
```

### Settings Model
```javascript
{
  shopName: string,
  email: string,
  phone: string,
  address: string,
  workingHours: string,
  socialMedia: {
    facebook: string,
    instagram: string,
    twitter: string,
    youtube: string
  }
}
```

## 🚀 Best Practices

### Error Handling
```javascript
try {
  const response = await getUserProfile()
  return response.data
} catch (error) {
  console.error('API Error:', error)
  throw new Error(error.response?.data?.message || 'Something went wrong')
}
```

### Loading States
```javascript
const [loading, setLoading] = useState(false)

const fetchData = async () => {
  setLoading(true)
  try {
    const data = await apiCall()
    setData(data)
  } finally {
    setLoading(false)
  }
}
```

### Caching
```javascript
// Simple caching với Map
const cache = new Map()

const getCachedData = async (key, apiCall) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await apiCall()
  cache.set(key, data)
  return data
}
```

## 🔒 Security
- JWT token authentication
- Request validation
- CORS configuration
- Rate limiting
- Input sanitization

## 📱 Mobile Support
- Offline handling
- Network status detection
- Retry mechanisms
- Optimized payloads
