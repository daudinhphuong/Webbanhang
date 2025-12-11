import mongoose from 'mongoose'
import BaseSchema from './Base.js'

const ReturnItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    default: ''
  }
}, { _id: false })

const RefundSchema = new mongoose.Schema({
  refundId: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  },
  method: {
    type: String,
    enum: ['original', 'store_credit', 'bank_transfer', 'cash'],
    default: 'original'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processedAt: {
    type: Date,
    default: null
  },
  transactionId: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false })

const ReturnSchema = new mongoose.Schema({
  returnNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
    default: () => `RET${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    default: ''
  },
  returnType: {
    type: String,
    enum: ['refund', 'exchange', 'repair'],
    required: true,
    default: 'refund'
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  items: {
    type: [ReturnItemSchema],
    default: [],
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
    default: 'requested',
    index: true
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refund: {
    type: RefundSchema,
    default: null
  },
  exchangeOrderId: {
    type: String,
    default: null
  },
  assignedTo: {
    id: { type: String, default: '' },
    name: { type: String, default: '' }
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  returnAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  adminNotes: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true })

ReturnSchema.add(BaseSchema)

// Generate return number before saving
ReturnSchema.pre('validate', async function autoGenerateReturnNumber(next) {
  try {
    if (!this.returnNumber) {
      this.returnNumber = `RET${Date.now()}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`
    }
    next()
  } catch (error) {
    next(error)
  }
})

// Indexes for better query performance
ReturnSchema.index({ orderId: 1, status: 1 })
ReturnSchema.index({ userId: 1, status: 1 })
ReturnSchema.index({ returnNumber: 1 })
ReturnSchema.index({ createdAt: -1 })

export default mongoose.model('Return', ReturnSchema)

