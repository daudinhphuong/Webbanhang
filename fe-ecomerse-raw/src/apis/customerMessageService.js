import axiosClient from './axiosClient'

/**
 * Gửi tin nhắn từ khách hàng đến admin (public - không cần đăng nhập)
 * @param {Object} messageData - Dữ liệu tin nhắn
 * @param {string} messageData.customerName - Tên khách hàng (bắt buộc)
 * @param {string} messageData.customerEmail - Email khách hàng (bắt buộc)
 * @param {string} messageData.subject - Chủ đề (bắt buộc)
 * @param {string} messageData.message - Nội dung tin nhắn (bắt buộc)
 * @param {string} [messageData.customerPhone] - Số điện thoại
 * @param {string} [messageData.customerId] - ID khách hàng (nếu đã login)
 * @param {string} [messageData.channel] - Kênh liên hệ (email, phone, live_chat, social, other)
 * @param {string} [messageData.priority] - Độ ưu tiên (high, medium, low)
 * @param {string} [messageData.orderId] - ID đơn hàng (nếu liên quan)
 * @returns {Promise} Response từ API
 */
export const sendCustomerMessage = (messageData) => {
  return axiosClient.post('/support/customer-messages/public', messageData)
}

/**
 * Lấy danh sách tin nhắn của khách hàng (cần đăng nhập)
 * @param {Object} params - Tham số query
 * @returns {Promise} Response từ API
 */
export const getMyMessages = (params = {}) => {
  return axiosClient.get('/support/customer-messages', { params })
}

/**
 * Lấy chi tiết một tin nhắn (cần đăng nhập)
 * @param {string} messageId - ID tin nhắn
 * @returns {Promise} Response từ API
 */
export const getMessageDetail = (messageId) => {
  return axiosClient.get(`/support/customer-messages/${messageId}`)
}

/**
 * Gửi phản hồi cho customer message (cần đăng nhập)
 * @param {string} messageId - ID tin nhắn
 * @param {Object} replyData - Dữ liệu phản hồi
 * @param {string} replyData.message - Nội dung phản hồi (bắt buộc)
 * @param {boolean} [replyData.isAdmin] - Có phải admin không
 * @returns {Promise} Response từ API
 */
export const replyCustomerMessage = (messageId, replyData) => {
  return axiosClient.post(`/support/customer-messages/${messageId}/replies`, replyData)
}

