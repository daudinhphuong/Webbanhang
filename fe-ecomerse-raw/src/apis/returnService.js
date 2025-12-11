import axiosClient from './axiosClient'

/**
 * Get eligible orders for return (user)
 * @returns {Promise} Response with eligible orders
 */
export const getEligibleOrders = () => {
  return axiosClient.get('/returns/eligible-orders')
}

/**
 * Get user's returns
 * @param {Object} params - Query parameters (page, limit, status)
 * @returns {Promise} Response with user's returns
 */
export const getMyReturns = (params = {}) => {
  return axiosClient.get('/returns/my-returns', { params })
}

/**
 * Get return by ID
 * @param {string} returnId - Return ID
 * @returns {Promise} Response with return details
 */
export const getReturnById = (returnId) => {
  return axiosClient.get(`/returns/${returnId}`)
}

/**
 * Create return request
 * @param {Object} returnData - Return request data
 * @param {string} returnData.orderId - Order ID
 * @param {string} returnData.returnType - Return type (refund, exchange, repair)
 * @param {string} returnData.reason - Reason for return
 * @param {string} [returnData.description] - Description
 * @param {Array} [returnData.items] - Items to return
 * @param {Array} [returnData.images] - Images
 * @returns {Promise} Response with created return
 */
export const createReturn = (returnData) => {
  return axiosClient.post('/returns', returnData)
}

/**
 * Update return status (admin only)
 * @param {string} returnId - Return ID
 * @param {Object} data - Update data (status, adminNotes, assignedTo)
 * @returns {Promise} Response with updated return
 */
export const updateReturnStatus = (returnId, data) => {
  return axiosClient.patch(`/admin/returns/${returnId}/status`, data)
}

/**
 * Process refund (admin only)
 * @param {string} returnId - Return ID
 * @param {Object} refundData - Refund data
 * @returns {Promise} Response
 */
export const processRefund = (returnId, refundData) => {
  return axiosClient.post(`/admin/returns/${returnId}/refund`, refundData)
}

/**
 * Complete refund (admin only)
 * @param {string} returnId - Return ID
 * @param {Object} data - Completion data (transactionId)
 * @returns {Promise} Response
 */
export const completeRefund = (returnId, data) => {
  return axiosClient.post(`/admin/returns/${returnId}/complete-refund`, data)
}

/**
 * Get all returns (admin only)
 * @param {Object} params - Query parameters (page, limit, status, returnType, search)
 * @returns {Promise} Response with returns and stats
 */
export const getAllReturns = (params = {}) => {
  return axiosClient.get('/admin/returns', { params })
}

/**
 * Create return (admin only)
 * @param {Object} returnData - Return data
 * @returns {Promise} Response with created return
 */
export const createReturnAdmin = (returnData) => {
  return axiosClient.post('/admin/returns', returnData)
}

