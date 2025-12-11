# Frontend E-commerce Application

## 📋 Tổng quan
Ứng dụng frontend cho hệ thống thương mại điện tử, được xây dựng bằng React.js với giao diện hiện đại và responsive.

## 🚀 Công nghệ sử dụng
- **React 18** - Framework chính
- **Vite** - Build tool và dev server
- **SCSS** - CSS preprocessor
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Lazy Loading** - Code splitting

## 📁 Cấu trúc thư mục

### `/src/components/`
Chứa các component tái sử dụng:
- **Header/** - Header và navigation
- **Footer/** - Footer của trang
- **Layout/** - Layout chính của ứng dụng
- **SafeImage/** - Component xử lý ảnh an toàn

### `/src/pages/`
Chứa các trang chính của ứng dụng:
- **News/** - Trang tin tức và chi tiết bài viết
- **Contacts/** - Trang liên hệ
- **UserSettings/** - Cài đặt tài khoản người dùng
- **AboutUs/** - Trang giới thiệu
- **OurShop/** - Trang cửa hàng
- **Cart/** - Trang giỏ hàng
- **Checkout/** - Trang thanh toán
- **Orders/** - Trang đơn hàng

### `/src/apis/`
Chứa các service API:
- **axiosClient.js** - Cấu hình Axios
- **newsService.js** - API tin tức
- **userService.js** - API người dùng
- **settingsService.js** - API cài đặt

### `/src/utils/`
Chứa các utility functions:
- **imageUtils.js** - Xử lý ảnh và placeholder
- **errorHandler.js** - Xử lý lỗi toàn cục

### `/src/routers/`
Cấu hình routing:
- **routers.js** - Định nghĩa các route

## 🛠️ Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## 🌐 URL chính
- **Trang chủ**: `http://localhost:5173/`
- **Tin tức**: `http://localhost:5173/news`
- **Liên hệ**: `http://localhost:5173/contacts`
- **Cài đặt**: `http://localhost:5173/user-settings`

## 📱 Responsive Design
Ứng dụng được thiết kế responsive, hoạt động tốt trên:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎨 UI/UX Features
- **Modern Design** - Thiết kế hiện đại, chuyên nghiệp
- **Dark/Light Mode** - Hỗ trợ chế độ tối/sáng
- **Smooth Animations** - Hiệu ứng mượt mà
- **Loading States** - Trạng thái loading cho UX tốt hơn
- **Error Handling** - Xử lý lỗi graceful

## 🔧 Development
- **Hot Reload** - Tự động reload khi có thay đổi
- **ESLint** - Code linting
- **SCSS** - CSS preprocessing
- **Component-based** - Kiến trúc component

## 📦 Build & Deploy
```bash
# Build production
npm run build

# Preview build
npm run preview
```

## 🤝 Contributing
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request
