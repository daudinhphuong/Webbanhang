import mongoose from 'mongoose'
import BaseSchema from './Base.js'

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  title: {
    type: String,
    default: ''
  },
  comment: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'pending',
    index: true
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    default: ''
  },
  orderId: {
    type: String,
    default: null,
    index: true
  },
  reply: {
    message: String,
    repliedBy: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User'
    },
    repliedAt: Date
  }
}, { timestamps: true })

ReviewSchema.add(BaseSchema)

// Indexes for better query performance
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 })
ReviewSchema.index({ userId: 1, productId: 1 })

export default mongoose.model('Review', ReviewSchema)

