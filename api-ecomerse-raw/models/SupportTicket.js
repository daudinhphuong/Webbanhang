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

const AssignedSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
  },
  { _id: false },
)

const HistorySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    description: { type: String, default: '' },
    performedBy: { type: AssignedSchema, default: () => ({}) },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false },
)

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerPhone: { type: String, default: '' },
    customerAvatar: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'product_issue',
        'refund',
        'shipping',
        'general_inquiry',
        'complaint',
        'technical_support',
        'other',
      ],
      default: 'general_inquiry',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
      default: 'open',
    },
    orderId: { type: String, default: '' },
    assignedTo: { type: AssignedSchema, default: () => ({}) },
    dueDate: { type: Date },
    tags: [{ type: String }],
    attachments: [{ type: String }],
    resolution: { type: String, default: '' },
    satisfaction: { type: Number, min: 1, max: 5 },
    timeSpent: { type: Number, default: 0 }, // minutes
    replies: { type: [ReplySchema], default: [] },
    watchers: { type: [String], default: [] },
    reopenedCount: { type: Number, default: 0 },
    history: { type: [HistorySchema], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
)

SupportTicketSchema.index({ ticketNumber: 1 })
SupportTicketSchema.index({ customerEmail: 1 })
SupportTicketSchema.index({ status: 1 })
SupportTicketSchema.index({ category: 1 })

export default mongoose.model('SupportTicket', SupportTicketSchema)


