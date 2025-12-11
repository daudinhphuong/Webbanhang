import express from 'express'
import {
  getProductReviews,
  getProductReviewStats,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  reportReview,
  checkUserPurchase,
  getAllReviews,
  getProductsForFilter,
  updateReviewStatus,
  addAdminReply,
  getAllProductRatingStats,
  getNegativeReviewsReport
} from '../controller/review.js'
import { authMiddleware, adminOnly } from '../middleware/middleware.js'

const router = express.Router()

console.log('Review router initialized')

// Test route to verify router is loaded
router.get('/test-reviews', (req, res) => {
  console.log('Test route hit!')
  res.json({ message: 'Review router is working!' })
})

// Public routes - must be exact match
router.get('/products/:productId/reviews', getProductReviews)
router.get('/products/:productId/reviews/stats', getProductReviewStats)

// Protected routes - require authentication
router.get('/products/:productId/check-purchase', authMiddleware, checkUserPurchase)
router.post('/products/:productId/reviews', authMiddleware, createReview) // Now requires auth and purchase
router.put('/reviews/:id', authMiddleware, updateReview)
router.delete('/reviews/:id', authMiddleware, deleteReview)
router.post('/reviews/:id/like', authMiddleware, likeReview)
router.post('/reviews/:id/report', reportReview) // Can be anonymous

// Admin routes - require authentication and admin role
// IMPORTANT: More specific routes must come BEFORE less specific ones
// e.g., /admin/reviews/rating-stats must come before /admin/reviews

router.get('/admin/products-for-filter', (req, res, next) => {
  console.log('GET /admin/products-for-filter route hit')
  next()
}, authMiddleware, adminOnly, getProductsForFilter)

router.get('/admin/reviews/rating-stats', (req, res, next) => {
  console.log('GET /admin/reviews/rating-stats route hit')
  next()
}, authMiddleware, adminOnly, getAllProductRatingStats)

router.get('/admin/reviews/negative-reports', (req, res, next) => {
  console.log('GET /admin/reviews/negative-reports route hit')
  next()
}, authMiddleware, adminOnly, getNegativeReviewsReport)

router.put('/admin/reviews/:id/status', authMiddleware, adminOnly, updateReviewStatus)
router.post('/admin/reviews/:id/reply', authMiddleware, adminOnly, addAdminReply)

// This must be LAST to avoid matching /admin/reviews/rating-stats
router.get('/admin/reviews', (req, res, next) => {
  console.log('GET /admin/reviews route hit')
  next()
}, authMiddleware, adminOnly, getAllReviews)

export default router

