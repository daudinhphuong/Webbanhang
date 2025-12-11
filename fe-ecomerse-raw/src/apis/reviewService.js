import axiosClient from './axiosClient'

// Get reviews for a product
export const getProductReviews = (productId, params = {}) => {
  return axiosClient.get(`/products/${productId}/reviews`, { params })
}

// Create a new review
export const createReview = (productId, reviewData) => {
  return axiosClient.post(`/products/${productId}/reviews`, reviewData)
}

// Update a review
export const updateReview = (reviewId, reviewData) => {
  return axiosClient.put(`/reviews/${reviewId}`, reviewData)
}

// Delete a review
export const deleteReview = (reviewId) => {
  return axiosClient.delete(`/reviews/${reviewId}`)
}

// Get review statistics for a product
export const getProductReviewStats = (productId) => {
  return axiosClient.get(`/products/${productId}/reviews/stats`)
}

// Like/Unlike a review
export const likeReview = (reviewId) => {
  return axiosClient.post(`/reviews/${reviewId}/like`)
}

// Report a review
export const reportReview = (reviewId, reason) => {
  return axiosClient.post(`/reviews/${reviewId}/report`, { reason })
}

// Check if user has purchased a product
export const checkUserPurchase = (productId) => {
  return axiosClient.get(`/products/${productId}/check-purchase`)
}

