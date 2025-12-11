import express from 'express'
import {
  listCustomerMessages,
  getCustomerMessage,
  createCustomerMessage,
  updateCustomerMessage,
  replyCustomerMessage,
} from '../controller/customerMessage.js'
import { authMiddleware } from '../middleware/middleware.js'

const router = express.Router()

router.get('/support/customer-messages', authMiddleware, listCustomerMessages)
router.get('/support/customer-messages/:id', authMiddleware, getCustomerMessage)
router.post('/support/customer-messages', authMiddleware, createCustomerMessage)
router.post('/support/customer-messages/public', createCustomerMessage)
router.patch('/support/customer-messages/:id', authMiddleware, updateCustomerMessage)
router.post('/support/customer-messages/:id/replies', authMiddleware, replyCustomerMessage)

export default router


