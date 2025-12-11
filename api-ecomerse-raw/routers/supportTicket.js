import express from 'express'
import {
  listSupportTickets,
  getSupportTicket,
  createSupportTicket,
  updateSupportTicket,
  replySupportTicket,
} from '../controller/supportTicket.js'
import { authMiddleware } from '../middleware/middleware.js'

const router = express.Router()

router.get('/support/tickets', authMiddleware, listSupportTickets)
router.get('/support/tickets/:id', authMiddleware, getSupportTicket)
router.post('/support/tickets', authMiddleware, createSupportTicket)
router.patch('/support/tickets/:id', authMiddleware, updateSupportTicket)
router.post('/support/tickets/:id/replies', authMiddleware, replySupportTicket)

export default router


