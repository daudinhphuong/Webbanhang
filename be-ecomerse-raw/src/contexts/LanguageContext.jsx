import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const translations = {
  en: {
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.reset': 'Reset',
    'common.view': 'View',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.saving': 'Saving...',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.total': 'Total',
    'common.quantity': 'Quantity',
    'common.price': 'Price',
    'common.amount': 'Amount',
    'common.select': 'Select',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.totalUsers': 'Total Users',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.revenueToday': 'Revenue Today',
    'dashboard.revenueMonth': 'Revenue This Month',
    'dashboard.newestOrders': 'Newest Orders',
    
    // Orders
    'orders.title': 'Orders Management',
    'orders.orderId': 'Order ID',
    'orders.customer': 'Customer',
    'orders.amount': 'Amount',
    'orders.payment': 'Payment',
    'orders.created': 'Created',
    'orders.status': 'Status',
    'orders.pending': 'Pending',
    'orders.processing': 'Processing',
    'orders.shipped': 'Shipped',
    'orders.delivered': 'Delivered',
    'orders.cancelled': 'Cancelled',
    'orders.update': 'Update',
    'orders.invoice': 'Invoice',
    'orders.details': 'Order Details',
    'orders.customerInfo': 'Customer Information',
    'orders.shippingAddress': 'Shipping Address',
    'orders.orderItems': 'Order Items',
    'orders.product': 'Product',
    'orders.size': 'Size',
    'orders.totalQuantity': 'Total Quantity',
    'orders.productTypes': 'Product Types',
    'orders.totalAmount': 'Total Amount',
    'orders.discount': 'Discount',
    'orders.paymentMethod': 'Payment Method',
    'orders.paymentStatus': 'Payment Status',
    'orders.addNotes': 'Add Notes',
    'orders.generateInvoice': 'Generate Invoice',
    'orders.exportCSV': 'Export CSV',
    
    // Users
    'users.title': 'Customer Management',
    'users.customer': 'Customer',
    'users.contact': 'Contact',
    'users.role': 'Role',
    'users.classification': 'Classification',
    'users.orders': 'Orders',
    'users.totalOrders': 'Total Orders',
    'users.totalSpent': 'Total Spent',
    'users.averageOrderValue': 'Average Order Value',
    'users.lastOrder': 'Last Order',
    'users.ban': 'Ban',
    'users.unban': 'Unban',
    'users.active': 'Active',
    'users.banned': 'Banned',
    'users.customerInfo': 'Customer Information',
    'users.customerStats': 'Customer Statistics',
    'users.purchaseHistory': 'Purchase History',
    
    // Products
    'products.title': 'Products Management',
    'products.name': 'Product Name',
    'products.category': 'Category',
    'products.brand': 'Brand',
    'products.stock': 'Stock',
    'products.price': 'Price',
    
    // Reviews
    'reviews.title': 'Reviews Management',
    'reviews.rating': 'Rating',
    'reviews.review': 'Review',
    'reviews.approve': 'Approve',
    'reviews.reject': 'Reject',
    'reviews.adminResponse': 'Admin Response',
    'reviews.addResponse': 'Add Response',
    'reviews.updateResponse': 'Update Response',
    
    // Products (continued)
    'products.add': 'Add Product',
    'products.edit': 'Edit Product',
    'products.delete': 'Delete Product',
    
    // Returns
    'returns.title': 'Returns Management',
    'returns.orderId': 'Order ID',
    'returns.customer': 'Customer',
    'returns.product': 'Product',
    'returns.reason': 'Reason',
    'returns.status': 'Status',
    'returns.requestDate': 'Request Date',
    'returns.approve': 'Approve',
    'returns.reject': 'Reject',
    'returns.process': 'Process',
    
    // Discounts
    'discounts.title': 'Discounts',
    'discounts.coupons': 'Coupons',
    'discounts.campaigns': 'Campaigns',
    'discounts.code': 'Code',
    'discounts.discount': 'Discount',
    'discounts.validFrom': 'Valid From',
    'discounts.validTo': 'Valid To',
    'discounts.status': 'Status',
    'discounts.add': 'Add',
    'discounts.edit': 'Edit',
    
    // Support
    'support.title': 'Support',
    'support.tickets': 'Support Tickets',
    'support.messages': 'Customer Messages',
    'support.subject': 'Subject',
    'support.status': 'Status',
    'support.priority': 'Priority',
    'support.created': 'Created',
    'support.reply': 'Reply',
    
    // About Posts
    'about.title': 'About Posts',
    'about.posts': 'Posts',
    'about.add': 'Add Post',
    'about.edit': 'Edit Post',
    'about.delete': 'Delete Post',
    'about.titleField': 'Title',
    'about.content': 'Content',
    
    // Catalog
    'catalog.title': 'Catalog',
    'catalog.categories': 'Categories',
    'catalog.brands': 'Brands',
    'catalog.name': 'Name',
    'catalog.description': 'Description',
    'catalog.add': 'Add',
    'catalog.edit': 'Edit',
    'catalog.delete': 'Delete',
    
    // Settings
    'settings.title': 'Settings',
    'settings.shopSettings': 'Shop Settings',
    'settings.paymentSettings': 'Payment Settings',
    'settings.shipping': 'Shipping',
    'settings.adminManagement': 'Admin Management',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Orders',
    'nav.products': 'Products',
    'nav.users': 'Users',
    'nav.reviews': 'Reviews',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.returns': 'Returns',
    'nav.discounts': 'Discounts',
    'nav.support': 'Support',
    'nav.about': 'About Posts',
    'nav.catalog': 'Catalog',
  },
  vi: {
    // Common
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.all': 'Tất cả',
    'common.reset': 'Đặt lại',
    'common.view': 'Xem',
    'common.edit': 'Sửa',
    'common.delete': 'Xóa',
    'common.save': 'Lưu',
    'common.saving': 'Đang lưu...',
    'common.cancel': 'Hủy',
    'common.close': 'Đóng',
    'common.loading': 'Đang tải...',
    'common.actions': 'Thao tác',
    'common.status': 'Trạng thái',
    'common.date': 'Ngày',
    'common.total': 'Tổng',
    'common.quantity': 'Số lượng',
    'common.price': 'Giá',
    'common.amount': 'Số tiền',
    'common.select': 'Chọn',
    
    // Dashboard
    'dashboard.title': 'Bảng điều khiển',
    'dashboard.totalProducts': 'Tổng sản phẩm',
    'dashboard.totalUsers': 'Tổng người dùng',
    'dashboard.totalOrders': 'Tổng đơn hàng',
    'dashboard.revenueToday': 'Doanh thu hôm nay',
    'dashboard.revenueMonth': 'Doanh thu tháng này',
    'dashboard.newestOrders': 'Đơn hàng mới nhất',
    
    // Orders
    'orders.title': 'Quản lý đơn hàng',
    'orders.orderId': 'Mã đơn',
    'orders.customer': 'Khách hàng',
    'orders.amount': 'Số tiền',
    'orders.payment': 'Thanh toán',
    'orders.created': 'Ngày tạo',
    'orders.status': 'Trạng thái',
    'orders.pending': 'Đang chờ',
    'orders.processing': 'Đang xử lý',
    'orders.shipped': 'Đang vận chuyển',
    'orders.delivered': 'Đã giao hàng',
    'orders.cancelled': 'Đã hủy',
    'orders.update': 'Cập nhật',
    'orders.invoice': 'Hóa đơn',
    'orders.details': 'Chi tiết đơn hàng',
    'orders.customerInfo': 'Thông tin khách hàng',
    'orders.shippingAddress': 'Địa chỉ giao hàng',
    'orders.orderItems': 'Sản phẩm trong đơn',
    'orders.product': 'Sản phẩm',
    'orders.size': 'Kích thước',
    'orders.totalQuantity': 'Tổng số lượng',
    'orders.productTypes': 'Loại sản phẩm',
    'orders.totalAmount': 'Tổng tiền',
    'orders.discount': 'Giảm giá',
    'orders.paymentMethod': 'Phương thức thanh toán',
    'orders.paymentStatus': 'Trạng thái thanh toán',
    'orders.addNotes': 'Thêm ghi chú',
    'orders.generateInvoice': 'Tạo hóa đơn',
    'orders.exportCSV': 'Xuất CSV',
    
    // Users
    'users.title': 'Quản lý khách hàng',
    'users.customer': 'Khách hàng',
    'users.contact': 'Liên hệ',
    'users.role': 'Vai trò',
    'users.classification': 'Phân loại',
    'users.orders': 'Đơn hàng',
    'users.totalOrders': 'Tổng đơn hàng',
    'users.totalSpent': 'Tổng đã chi tiêu',
    'users.averageOrderValue': 'Giá trị đơn hàng trung bình',
    'users.lastOrder': 'Đơn hàng cuối',
    'users.ban': 'Khóa',
    'users.unban': 'Mở khóa',
    'users.active': 'Hoạt động',
    'users.banned': 'Đã khóa',
    'users.customerInfo': 'Thông tin khách hàng',
    'users.customerStats': 'Thống kê khách hàng',
    'users.purchaseHistory': 'Lịch sử mua hàng',
    
    // Products
    'products.title': 'Quản lý sản phẩm',
    'products.name': 'Tên sản phẩm',
    'products.category': 'Danh mục',
    'products.brand': 'Thương hiệu',
    'products.stock': 'Tồn kho',
    'products.price': 'Giá',
    
    // Reviews
    'reviews.title': 'Quản lý đánh giá',
    'reviews.rating': 'Đánh giá',
    'reviews.review': 'Bình luận',
    'reviews.approve': 'Duyệt',
    'reviews.reject': 'Từ chối',
    'reviews.adminResponse': 'Phản hồi admin',
    'reviews.addResponse': 'Thêm phản hồi',
    'reviews.updateResponse': 'Cập nhật phản hồi',
    
    // Products (continued)
    'products.add': 'Thêm sản phẩm',
    'products.edit': 'Sửa sản phẩm',
    'products.delete': 'Xóa sản phẩm',
    
    // Returns
    'returns.title': 'Quản lý trả hàng',
    'returns.orderId': 'Mã đơn',
    'returns.customer': 'Khách hàng',
    'returns.product': 'Sản phẩm',
    'returns.reason': 'Lý do',
    'returns.status': 'Trạng thái',
    'returns.requestDate': 'Ngày yêu cầu',
    'returns.approve': 'Chấp nhận',
    'returns.reject': 'Từ chối',
    'returns.process': 'Xử lý',
    
    // Discounts
    'discounts.title': 'Giảm giá',
    'discounts.coupons': 'Mã giảm giá',
    'discounts.campaigns': 'Chiến dịch',
    'discounts.code': 'Mã',
    'discounts.discount': 'Giảm giá',
    'discounts.validFrom': 'Hiệu lực từ',
    'discounts.validTo': 'Đến ngày',
    'discounts.status': 'Trạng thái',
    'discounts.add': 'Thêm',
    'discounts.edit': 'Sửa',
    
    // Support
    'support.title': 'Hỗ trợ',
    'support.tickets': 'Yêu cầu hỗ trợ',
    'support.messages': 'Tin nhắn khách hàng',
    'support.subject': 'Chủ đề',
    'support.status': 'Trạng thái',
    'support.priority': 'Độ ưu tiên',
    'support.created': 'Ngày tạo',
    'support.reply': 'Trả lời',
    
    // About Posts
    'about.title': 'Bài viết giới thiệu',
    'about.posts': 'Bài viết',
    'about.add': 'Thêm bài viết',
    'about.edit': 'Sửa bài viết',
    'about.delete': 'Xóa bài viết',
    'about.titleField': 'Tiêu đề',
    'about.content': 'Nội dung',
    
    // Catalog
    'catalog.title': 'Danh mục',
    'catalog.categories': 'Danh mục sản phẩm',
    'catalog.brands': 'Thương hiệu',
    'catalog.name': 'Tên',
    'catalog.description': 'Mô tả',
    'catalog.add': 'Thêm',
    'catalog.edit': 'Sửa',
    'catalog.delete': 'Xóa',
    
    // Settings
    'settings.title': 'Cài đặt',
    'settings.shopSettings': 'Cài đặt cửa hàng',
    'settings.paymentSettings': 'Cài đặt thanh toán',
    'settings.shipping': 'Vận chuyển',
    'settings.adminManagement': 'Quản lý admin',
    
    // Navigation
    'nav.dashboard': 'Bảng điều khiển',
    'nav.orders': 'Đơn hàng',
    'nav.products': 'Sản phẩm',
    'nav.users': 'Khách hàng',
    'nav.reviews': 'Đánh giá',
    'nav.settings': 'Cài đặt',
    'nav.logout': 'Đăng xuất',
    'nav.returns': 'Trả hàng',
    'nav.discounts': 'Giảm giá',
    'nav.support': 'Hỗ trợ',
    'nav.about': 'Bài viết giới thiệu',
    'nav.catalog': 'Danh mục',
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to Vietnamese
    const saved = localStorage.getItem('admin_language')
    return saved || 'vi'
  })

  useEffect(() => {
    localStorage.setItem('admin_language', language)
  }, [language])

  const t = (key) => {
    return translations[language]?.[key] || translations['vi'][key] || key
  }

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

