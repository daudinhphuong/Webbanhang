import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilPuzzle,
  cilDescription,
  cilNotes,
  cilStar,
  cilSettings,
  cilCommentSquare,
  cilBell,
  cilFolder,
} from '@coreui/icons'

const UserGuide = () => {
  const sections = [
    {
      id: 'dashboard',
      title: 'Dashboard - Bảng điều khiển',
      icon: cilSpeedometer,
      description: 'Tổng quan về hoạt động của cửa hàng',
      content: (
        <div>
          <p><strong>Dashboard</strong> cung cấp cái nhìn tổng quan về hoạt động của cửa hàng:</p>
          <ul>
            <li><strong>Thống kê tổng quan:</strong> Số lượng đơn hàng, doanh thu, khách hàng, sản phẩm</li>
            <li><strong>Biểu đồ doanh thu:</strong> Theo dõi doanh thu theo thời gian</li>
            <li><strong>Đơn hàng mới nhất:</strong> Xem các đơn hàng vừa được tạo</li>
            <li><strong>Top sản phẩm bán chạy:</strong> Sản phẩm được mua nhiều nhất</li>
            <li><strong>Thống kê người dùng:</strong> Số lượng khách hàng mới, khách hàng hoạt động</li>
          </ul>
          <p><strong>Cách sử dụng:</strong> Dashboard tự động cập nhật dữ liệu theo thời gian thực. Bạn có thể xem các chỉ số quan trọng ngay khi đăng nhập.</p>
        </div>
      ),
    },
    {
      id: 'users',
      title: 'Users - Quản lý người dùng',
      icon: cilUser,
      description: 'Quản lý thông tin khách hàng và quyền truy cập',
      content: (
        <div>
          <p><strong>Quản lý người dùng</strong> cho phép bạn:</p>
          <ul>
            <li><strong>Xem danh sách người dùng:</strong> Tất cả khách hàng đã đăng ký</li>
            <li><strong>Tìm kiếm người dùng:</strong> Theo tên, email, số điện thoại</li>
            <li><strong>Xem chi tiết:</strong> Thông tin cá nhân, địa chỉ, lịch sử đơn hàng</li>
            <li><strong>Quản lý quyền:</strong> Phân quyền admin, kích hoạt/vô hiệu hóa tài khoản</li>
            <li><strong>Xóa người dùng:</strong> Xóa tài khoản không còn sử dụng</li>
          </ul>
          <p><strong>Lưu ý:</strong> Chỉ admin mới có quyền thay đổi quyền truy cập của người dùng.</p>
        </div>
      ),
    },
    {
      id: 'products',
      title: 'Products - Quản lý sản phẩm',
      icon: cilPuzzle,
      description: 'Thêm, sửa, xóa và quản lý sản phẩm',
      content: (
        <div>
          <p><strong>Quản lý sản phẩm</strong> bao gồm:</p>
          <ul>
            <li><strong>Danh sách sản phẩm:</strong> Xem tất cả sản phẩm với hình ảnh, giá, số lượng</li>
            <li><strong>Thêm sản phẩm mới:</strong> Tên, mô tả, giá, hình ảnh, danh mục, thương hiệu</li>
            <li><strong>Chỉnh sửa sản phẩm:</strong> Cập nhật thông tin, giá, số lượng tồn kho</li>
            <li><strong>Xóa sản phẩm:</strong> Xóa sản phẩm không còn bán</li>
            <li><strong>Tìm kiếm và lọc:</strong> Theo tên, danh mục, thương hiệu, giá</li>
            <li><strong>Quản lý tồn kho:</strong> Cập nhật số lượng sản phẩm còn lại</li>
            <li><strong>Quản lý hình ảnh:</strong> Upload nhiều hình ảnh cho mỗi sản phẩm</li>
          </ul>
          <p><strong>Mẹo:</strong> Luôn cập nhật số lượng tồn kho để tránh bán quá số lượng có sẵn.</p>
        </div>
      ),
    },
    {
      id: 'orders',
      title: 'Orders - Quản lý đơn hàng',
      icon: cilDescription,
      description: 'Theo dõi và xử lý đơn hàng',
      content: (
        <div>
          <p><strong>Quản lý đơn hàng</strong> giúp bạn:</p>
          <ul>
            <li><strong>Xem tất cả đơn hàng:</strong> Danh sách đơn hàng với trạng thái</li>
            <li><strong>Lọc đơn hàng:</strong> Theo trạng thái (pending, processing, shipped, delivered, cancelled)</li>
            <li><strong>Xem chi tiết đơn hàng:</strong> Sản phẩm, số lượng, giá, thông tin khách hàng</li>
            <li><strong>Cập nhật trạng thái:</strong> Chuyển đơn hàng sang trạng thái mới</li>
            <li><strong>In hóa đơn:</strong> Xuất hóa đơn cho khách hàng</li>
            <li><strong>Hủy đơn hàng:</strong> Hủy đơn hàng không thể xử lý</li>
            <li><strong>Tìm kiếm:</strong> Theo mã đơn hàng, tên khách hàng, email</li>
          </ul>
          <p><strong>Quy trình xử lý:</strong> Pending → Processing → Shipped → Delivered</p>
        </div>
      ),
    },
    {
      id: 'returns',
      title: 'Returns - Đổi trả hàng',
      icon: cilNotes,
      description: 'Xử lý yêu cầu đổi trả hàng',
      content: (
        <div>
          <p><strong>Quản lý đổi trả</strong> bao gồm:</p>
          <ul>
            <li><strong>Xem yêu cầu đổi trả:</strong> Danh sách các yêu cầu từ khách hàng</li>
            <li><strong>Xem lý do:</strong> Lý do khách hàng muốn đổi/trả</li>
            <li><strong>Duyệt yêu cầu:</strong> Chấp nhận hoặc từ chối yêu cầu</li>
            <li><strong>Xử lý hoàn tiền:</strong> Hoàn tiền cho khách hàng nếu được duyệt</li>
            <li><strong>Theo dõi trạng thái:</strong> Pending, Approved, Rejected, Completed</li>
          </ul>
          <p><strong>Lưu ý:</strong> Kiểm tra điều kiện đổi trả (thời gian, tình trạng sản phẩm) trước khi duyệt.</p>
        </div>
      ),
    },
    {
      id: 'discounts',
      title: 'Discounts - Khuyến mãi',
      icon: cilStar,
      description: 'Quản lý mã giảm giá và chiến dịch khuyến mãi',
      content: (
        <div>
          <p><strong>Quản lý khuyến mãi</strong> gồm 2 phần:</p>
          <h5>1. Coupons - Mã giảm giá</h5>
          <ul>
            <li><strong>Tạo mã giảm giá:</strong> Mã code, phần trăm hoặc số tiền giảm</li>
            <li><strong>Thiết lập điều kiện:</strong> Giá trị đơn hàng tối thiểu, số lần sử dụng</li>
            <li><strong>Thời hạn:</strong> Ngày bắt đầu và kết thúc</li>
            <li><strong>Áp dụng cho:</strong> Tất cả sản phẩm hoặc sản phẩm cụ thể</li>
            <li><strong>Kích hoạt/vô hiệu hóa:</strong> Bật/tắt mã giảm giá</li>
          </ul>
          <h5>2. Campaigns - Chiến dịch khuyến mãi</h5>
          <ul>
            <li><strong>Tạo chiến dịch:</strong> Tên, mô tả, thời gian diễn ra</li>
            <li><strong>Thiết lập giảm giá:</strong> Phần trăm hoặc số tiền giảm</li>
            <li><strong>Chọn sản phẩm:</strong> Áp dụng cho sản phẩm hoặc danh mục cụ thể</li>
            <li><strong>Hiển thị banner:</strong> Banner quảng cáo chiến dịch</li>
            <li><strong>Theo dõi hiệu quả:</strong> Số đơn hàng, doanh thu từ chiến dịch</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'settings',
      title: 'Settings - Cài đặt',
      icon: cilSettings,
      description: 'Cấu hình hệ thống và cửa hàng',
      content: (
        <div>
          <p><strong>Cài đặt hệ thống</strong> gồm 4 phần:</p>
          <h5>1. Shop Settings - Cài đặt cửa hàng</h5>
          <ul>
            <li><strong>Thông tin cơ bản:</strong> Tên cửa hàng, logo, mô tả</li>
            <li><strong>Liên hệ:</strong> Email, số điện thoại, địa chỉ</li>
            <li><strong>Mạng xã hội:</strong> Facebook, Instagram, Twitter, YouTube</li>
            <li><strong>SEO:</strong> Tiêu đề, mô tả, từ khóa cho SEO</li>
            <li><strong>Bảo trì:</strong> Bật/tắt chế độ bảo trì</li>
            <li><strong>Đăng ký:</strong> Cho phép/không cho phép đăng ký tài khoản mới</li>
          </ul>
          <h5>2. Shipping Settings - Cài đặt vận chuyển</h5>
          <ul>
            <li><strong>Phí vận chuyển:</strong> Thiết lập phí ship cố định hoặc theo khu vực</li>
            <li><strong>Phương thức vận chuyển:</strong> Giao hàng nhanh, giao hàng tiêu chuẩn</li>
            <li><strong>Thời gian giao hàng:</strong> Số ngày dự kiến giao hàng</li>
            <li><strong>Khu vực giao hàng:</strong> Các tỉnh/thành phố được hỗ trợ</li>
          </ul>
          <h5>3. Payment Settings - Cài đặt thanh toán</h5>
          <ul>
            <li><strong>Phương thức thanh toán:</strong> COD, VNPay, MoMo, PayPal, Stripe</li>
            <li><strong>Kích hoạt phương thức:</strong> Bật/tắt từng phương thức</li>
            <li><strong>Cấu hình phí:</strong> Phí cố định hoặc phần trăm cho mỗi phương thức</li>
            <li><strong>Thiết lập API:</strong> Cấu hình thông tin API cho các cổng thanh toán</li>
            <li><strong>Cài đặt chung:</strong> Số tiền tối thiểu/tối đa, thời gian timeout</li>
            <li><strong>Chính sách hoàn tiền:</strong> Quy định về hoàn tiền</li>
          </ul>
          <h5>4. Admin Management - Quản lý admin</h5>
          <ul>
            <li><strong>Danh sách admin:</strong> Xem tất cả tài khoản admin</li>
            <li><strong>Thêm admin mới:</strong> Tạo tài khoản admin mới</li>
            <li><strong>Phân quyền:</strong> Cấp quyền cho từng admin</li>
            <li><strong>Xóa admin:</strong> Xóa tài khoản admin không còn sử dụng</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'reviews',
      title: 'Reviews - Đánh giá sản phẩm',
      icon: cilCommentSquare,
      description: 'Quản lý đánh giá và phản hồi của khách hàng',
      content: (
        <div>
          <p><strong>Quản lý đánh giá</strong> gồm 3 phần:</p>
          <h5>1. Reviews Management - Quản lý đánh giá</h5>
          <ul>
            <li><strong>Xem tất cả đánh giá:</strong> Danh sách đánh giá từ khách hàng</li>
            <li><strong>Lọc đánh giá:</strong> Theo sản phẩm, trạng thái (pending, approved, rejected)</li>
            <li><strong>Duyệt đánh giá:</strong> Phê duyệt hoặc từ chối đánh giá</li>
            <li><strong>Phản hồi đánh giá:</strong> Trả lời đánh giá của khách hàng</li>
            <li><strong>Xóa đánh giá:</strong> Xóa đánh giá spam hoặc không phù hợp</li>
            <li><strong>Đánh dấu mua hàng xác thực:</strong> Xác nhận khách hàng đã mua sản phẩm</li>
          </ul>
          <h5>2. Rating Statistics - Thống kê đánh giá</h5>
          <ul>
            <li><strong>Thống kê tổng quan:</strong> Tổng số đánh giá, điểm trung bình</li>
            <li><strong>Phân bố điểm:</strong> Số lượng đánh giá theo từng sao (1-5 sao)</li>
            <li><strong>Top sản phẩm được đánh giá:</strong> Sản phẩm có nhiều đánh giá nhất</li>
            <li><strong>Xu hướng đánh giá:</strong> Biểu đồ đánh giá theo thời gian</li>
          </ul>
          <h5>3. Negative Reviews Reports - Báo cáo đánh giá tiêu cực</h5>
          <ul>
            <li><strong>Đánh giá 1-2 sao:</strong> Xem các đánh giá tiêu cực</li>
            <li><strong>Phân loại vấn đề:</strong> Chất lượng, giao hàng, dịch vụ</li>
            <li><strong>Xử lý khiếu nại:</strong> Liên hệ khách hàng để giải quyết</li>
            <li><strong>Theo dõi cải thiện:</strong> Đánh giá đã được xử lý hay chưa</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'support',
      title: 'Support - Hỗ trợ khách hàng',
      icon: cilBell,
      description: 'Quản lý tin nhắn và ticket hỗ trợ',
      content: (
        <div>
          <p><strong>Hỗ trợ khách hàng</strong> gồm 2 phần:</p>
          <h5>1. Customer Messages - Tin nhắn khách hàng</h5>
          <ul>
            <li><strong>Xem tin nhắn:</strong> Tất cả tin nhắn từ khách hàng qua form liên hệ</li>
            <li><strong>Lọc tin nhắn:</strong> Theo trạng thái (unread, in_progress, resolved, closed)</li>
            <li><strong>Ưu tiên:</strong> High, Medium, Low</li>
            <li><strong>Kênh liên hệ:</strong> Email, Phone, Live Chat, Social Media</li>
            <li><strong>Trả lời tin nhắn:</strong> Gửi phản hồi trực tiếp cho khách hàng</li>
            <li><strong>Gán nhân viên:</strong> Phân công nhân viên xử lý tin nhắn</li>
            <li><strong>Cập nhật trạng thái:</strong> Đánh dấu đã đọc, đang xử lý, đã giải quyết</li>
            <li><strong>Tìm kiếm:</strong> Theo tên, email, nội dung tin nhắn</li>
          </ul>
          <h5>2. Support Tickets - Ticket hỗ trợ</h5>
          <ul>
            <li><strong>Tạo ticket mới:</strong> Tạo ticket hỗ trợ cho khách hàng</li>
            <li><strong>Xem danh sách ticket:</strong> Tất cả ticket đang xử lý</li>
            <li><strong>Lọc ticket:</strong> Theo trạng thái, mức độ ưu tiên, danh mục</li>
            <li><strong>Gán nhân viên:</strong> Phân công nhân viên xử lý ticket</li>
            <li><strong>Thiết lập deadline:</strong> Thời hạn xử lý ticket</li>
            <li><strong>Trả lời ticket:</strong> Gửi phản hồi cho khách hàng</li>
            <li><strong>Giải quyết ticket:</strong> Đánh dấu đã giải quyết và ghi chú</li>
            <li><strong>Đánh giá:</strong> Khách hàng đánh giá chất lượng hỗ trợ</li>
            <li><strong>Danh mục:</strong> Technical, Billing, Product, Other</li>
          </ul>
          <p><strong>Lưu ý:</strong> Luôn phản hồi tin nhắn và ticket trong thời gian sớm nhất để tăng sự hài lòng của khách hàng.</p>
        </div>
      ),
    },
    {
      id: 'catalog',
      title: 'Catalog - Danh mục',
      icon: cilFolder,
      description: 'Quản lý danh mục và thương hiệu',
      content: (
        <div>
          <p><strong>Quản lý danh mục</strong> gồm 2 phần:</p>
          <h5>1. Categories - Danh mục sản phẩm</h5>
          <ul>
            <li><strong>Xem danh sách:</strong> Tất cả danh mục sản phẩm</li>
            <li><strong>Thêm danh mục:</strong> Tên, mô tả, hình ảnh, danh mục cha</li>
            <li><strong>Chỉnh sửa:</strong> Cập nhật thông tin danh mục</li>
            <li><strong>Xóa danh mục:</strong> Xóa danh mục không còn sử dụng</li>
            <li><strong>Cấu trúc cây:</strong> Danh mục cha và danh mục con</li>
            <li><strong>Sắp xếp:</strong> Thứ tự hiển thị danh mục</li>
          </ul>
          <h5>2. Brands - Thương hiệu</h5>
          <ul>
            <li><strong>Xem danh sách:</strong> Tất cả thương hiệu</li>
            <li><strong>Thêm thương hiệu:</strong> Tên, logo, mô tả, website</li>
            <li><strong>Chỉnh sửa:</strong> Cập nhật thông tin thương hiệu</li>
            <li><strong>Xóa thương hiệu:</strong> Xóa thương hiệu không còn hợp tác</li>
            <li><strong>Quản lý logo:</strong> Upload và cập nhật logo thương hiệu</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'about',
      title: 'About Posts - Bài viết giới thiệu',
      icon: cilDescription,
      description: 'Quản lý nội dung trang giới thiệu',
      content: (
        <div>
          <p><strong>Quản lý bài viết giới thiệu</strong> cho phép bạn:</p>
          <ul>
            <li><strong>Xem danh sách bài viết:</strong> Tất cả bài viết đã tạo</li>
            <li><strong>Tạo bài viết mới:</strong> Tiêu đề, nội dung, hình ảnh</li>
            <li><strong>Chỉnh sửa:</strong> Cập nhật nội dung bài viết</li>
            <li><strong>Xóa bài viết:</strong> Xóa bài viết không còn sử dụng</li>
            <li><strong>Xuất bản:</strong> Hiển thị hoặc ẩn bài viết</li>
            <li><strong>Soạn thảo:</strong> Editor rich text để định dạng nội dung</li>
          </ul>
          <p><strong>Mẹo:</strong> Sử dụng hình ảnh chất lượng cao và nội dung hấp dẫn để thu hút khách hàng.</p>
        </div>
      ),
    },
  ]

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h2 className="mb-0">
              <CIcon icon={cilDescription} className="me-2" />
              Hướng dẫn sử dụng Admin Panel
            </h2>
          </CCardHeader>
          <CCardBody>
            <p className="text-muted mb-4">
              Tài liệu hướng dẫn chi tiết cách sử dụng các chức năng trong hệ thống quản lý cửa hàng.
              Chọn từng mục bên dưới để xem hướng dẫn chi tiết.
            </p>

            <CAccordion activeItemKey={0}>
              {sections.map((section, index) => (
                <CAccordionItem itemKey={index} key={section.id}>
                  <CAccordionHeader>
                    <div className="d-flex align-items-center w-100">
                      <CIcon icon={section.icon} className="me-3" size="lg" />
                      <div className="flex-grow-1">
                        <strong>{section.title}</strong>
                        <div className="text-muted small mt-1">{section.description}</div>
                      </div>
                    </div>
                  </CAccordionHeader>
                  <CAccordionBody>
                    {section.content}
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>

            <div className="mt-4 p-4  rounded">
              <h5>💡 Mẹo sử dụng</h5>
              <CListGroup flush>
                <CListGroupItem>
                  <strong>Lưu thường xuyên:</strong> Luôn nhấn nút "Save" sau khi thay đổi cài đặt
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Kiểm tra dữ liệu:</strong> Xem lại thông tin trước khi lưu để tránh sai sót
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Backup:</strong> Thường xuyên sao lưu dữ liệu quan trọng
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Bảo mật:</strong> Không chia sẻ thông tin đăng nhập với người khác
                </CListGroupItem>
                <CListGroupItem>
                  <strong>Hỗ trợ:</strong> Nếu gặp vấn đề, liên hệ đội ngũ kỹ thuật qua phần Support
                </CListGroupItem>
              </CListGroup>
            </div>

            <div className="mt-4 p-4 bg-info bg-opacity-10 rounded">
              <h5>📞 Liên hệ hỗ trợ</h5>
              <p className="mb-0">
                Nếu bạn cần hỗ trợ thêm hoặc gặp lỗi trong quá trình sử dụng, vui lòng:
              </p>
              <ul className="mt-2">
                <li>Tạo ticket hỗ trợ trong phần <strong>Support → Support Tickets</strong></li>
                <li>Gửi tin nhắn qua phần <strong>Support → Customer Messages</strong></li>
                <li>Liên hệ trực tiếp qua email hoặc số điện thoại trong <strong>Settings → Shop Settings</strong></li>
              </ul>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default UserGuide

