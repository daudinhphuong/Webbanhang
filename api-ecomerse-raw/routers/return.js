import express from 'express'
import {
  getAllReturns,
  getReturnById,
  getUserReturns,
  createReturn,
  updateReturnStatus,
  processRefund,
  completeRefund,
  getEligibleOrders
} from '../controller/return.js'
import { authMiddleware, adminOnly } from '../middleware/middleware.js'

const router = express.Router()

// Public/User routes
router.get('/returns/eligible-orders', authMiddleware, getEligibleOrders)
router.get('/returns/my-returns', authMiddleware, getUserReturns)
router.post('/returns', authMiddleware, createReturn)
router.get('/returns/:id', authMiddleware, getReturnById)

// Admin routes
router.get('/admin/returns', authMiddleware, adminOnly, getAllReturns)
router.post('/admin/returns', authMiddleware, adminOnly, createReturn) // Admin can create returns
router.patch('/admin/returns/:id/status', authMiddleware, adminOnly, updateReturnStatus)
router.post('/admin/returns/:id/refund', authMiddleware, adminOnly, processRefund)
router.post('/admin/returns/:id/complete-refund', authMiddleware, adminOnly, completeRefund)

export default router

