import mongoose from 'mongoose'

const ReplySchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    senderId: { type: String, default: '' },
    senderName: { type: String, default: '' },
    senderRole: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
  },
  {
    _id: false,
    timestamps: { createdAt: true, updatedAt: false },
  },
)

const AssignedToSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
  },
  { _id: false },
)

const CustomerMessageSchema = new mongoose.Schema(
  {
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerPhone: { type: String, default: '' },
    customerAvatar: { type: String, default: '' },
    channel: {
      type: String,
      enum: ['live_chat', 'email', 'phone', 'social', 'other'],
      default: 'email',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['unread', 'in_progress', 'resolved', 'closed'],
      default: 'unread',
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    attachments: [{ type: String }],
    orderId: { type: String, default: '' },
    assignedTo: { type: AssignedToSchema, default: () => ({}) },
    replies: { type: [ReplySchema], default: [] },
    tags: [{ type: String }],
    lastActivity: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
)

CustomerMessageSchema.pre('save', function preSave(next) {
  this.lastActivity = new Date()
  next()
})

CustomerMessageSchema.pre('findOneAndUpdate', function preFindAndUpdate(next) {
  this.set({ lastActivity: new Date() })
  next()
})

export default mongoose.model('CustomerMessage', CustomerMessageSchema)


