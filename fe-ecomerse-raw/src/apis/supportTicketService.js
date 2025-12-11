import axiosClient from './axiosClient'

/**
 * Lấy danh sách support tickets của user (cần đăng nhập)
 * @param {Object} params - Tham số query
 * @returns {Promise} Response từ API
 */
export const getMyTickets = (params = {}) => {
  return axiosClient.get('/support/tickets', { params })
}

/**
 * Lấy chi tiết một support ticket (cần đăng nhập)
 * @param {string} ticketId - ID ticket
 * @returns {Promise} Response từ API
 */
export const getTicketDetail = (ticketId) => {
  return axiosClient.get(`/support/tickets/${ticketId}`)
}

/**
 * Tạo support ticket mới (cần đăng nhập)
 * @param {Object} ticketData - Dữ liệu ticket
 * @param {string} ticketData.subject - Chủ đề (bắt buộc)
 * @param {string} ticketData.description - Mô tả (bắt buộc)
 * @param {string} [ticketData.category] - Danh mục
 * @param {string} [ticketData.priority] - Độ ưu tiên (high, medium, low)
 * @param {string} [ticketData.orderId] - ID đơn hàng (nếu liên quan)
 * @param {Array} [ticketData.tags] - Tags
 * @returns {Promise} Response từ API
 */
export const createTicket = (ticketData) => {
  return axiosClient.post('/support/tickets', ticketData)
}

/**
 * Cập nhật support ticket (cần đăng nhập)
 * @param {string} ticketId - ID ticket
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise} Response từ API
 */
export const updateTicket = (ticketId, updateData) => {
  return axiosClient.patch(`/support/tickets/${ticketId}`, updateData)
}

/**
 * Gửi phản hồi cho support ticket (cần đăng nhập)
 * @param {string} ticketId - ID ticket
 * @param {Object} replyData - Dữ liệu phản hồi
 * @param {string} replyData.message - Nội dung phản hồi (bắt buộc)
 * @returns {Promise} Response từ API
 */
export const replyTicket = (ticketId, replyData) => {
  return axiosClient.post(`/support/tickets/${ticketId}/replies`, replyData)
}

