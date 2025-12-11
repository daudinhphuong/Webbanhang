import CustomerMessage from '../models/CustomerMessage.js'

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100)
  return { page, limit }
}

const buildMessageFilters = (query) => {
  const filters = {}
  if (query.status && query.status !== 'all') filters.status = query.status
  if (query.channel && query.channel !== 'all') filters.channel = query.channel
  if (query.priority && query.priority !== 'all') filters.priority = query.priority

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i')
    filters.$or = [
      { customerName: searchRegex },
      { customerEmail: searchRegex },
      { subject: searchRegex },
      { message: searchRegex },
      { orderId: searchRegex },
    ]
  }

  return filters
}

const getMessageStats = async () => {
  const [
    total,
    unread,
    inProgress,
    resolved,
    closed,
    repliesAggregate,
    responseAggregate,
    channelStats,
    priorityStats,
  ] =
    await Promise.all([
      CustomerMessage.countDocuments(),
      CustomerMessage.countDocuments({ status: 'unread' }),
      CustomerMessage.countDocuments({ status: 'in_progress' }),
      CustomerMessage.countDocuments({ status: 'resolved' }),
      CustomerMessage.countDocuments({ status: 'closed' }),
      CustomerMessage.aggregate([
        { $unwind: { path: '$replies', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalReplies: { $sum: { $cond: [{ $ifNull: ['$replies', false] }, 1, 0] } },
            totalMessages: { $sum: 1 },
          },
        },
      ]),
      CustomerMessage.aggregate([
        {
          $project: {
            responseTime: {
              $cond: [
                { $and: [{ $ifNull: ['$lastActivity', false] }, { $ifNull: ['$createdAt', false] }] },
                { $subtract: ['$lastActivity', '$createdAt'] },
                null,
              ],
            },
          },
        },
        { $match: { responseTime: { $ne: null } } },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
          },
        },
      ]),
      CustomerMessage.aggregate([
        {
          $group: {
            _id: '$channel',
            count: { $sum: 1 },
          },
        },
      ]),
      CustomerMessage.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),
    ])

  return {
    totalMessages: total,
    unreadMessages: unread,
    inProgressMessages: inProgress,
    resolvedMessages: resolved,
    closedMessages: closed,
    averageRepliesPerMessage:
      repliesAggregate.length > 0 && repliesAggregate[0].totalReplies
        ? Number((repliesAggregate[0].totalReplies / repliesAggregate[0].totalMessages).toFixed(2))
        : 0,
    averageResponseTime:
      responseAggregate.length > 0 && responseAggregate[0].avgResponseTime
        ? Number((responseAggregate[0].avgResponseTime / (1000 * 60 * 60)).toFixed(2))
        : 0,
    customerSatisfaction: 0,
    channels: channelStats.map((item) => ({ id: item._id, name: item._id, count: item.count })),
    priorities: priorityStats.map((item) => ({ id: item._id, name: item._id, count: item.count })),
  }
}

export const listCustomerMessages = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query)
    const filters = buildMessageFilters(req.query)

    const sort = req.query.sort || '-createdAt'

    const [messages, totalFiltered, stats] = await Promise.all([
      CustomerMessage.find(filters)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CustomerMessage.countDocuments(filters),
      getMessageStats(),
    ])

    res.json({
      data: messages,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('listCustomerMessages error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách tin nhắn', error: error.message })
  }
}

export const getCustomerMessage = async (req, res) => {
  try {
    const message = await CustomerMessage.findById(req.params.id).lean()
    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' })
    }
    res.json(message)
  } catch (error) {
    console.error('getCustomerMessage error:', error)
    res.status(500).json({ message: 'Không thể lấy tin nhắn', error: error.message })
  }
}

export const createCustomerMessage = async (req, res) => {
  try {
    const payload = req.body || {}
    if (!payload.customerName || !payload.customerEmail || !payload.subject || !payload.message) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
    }

    const message = await CustomerMessage.create({
      ...payload,
      lastActivity: new Date(),
    })

    res.status(201).json({ message: 'Tạo tin nhắn thành công', data: message })
  } catch (error) {
    console.error('createCustomerMessage error:', error)
    res.status(500).json({ message: 'Không thể tạo tin nhắn', error: error.message })
  }
}

export const updateCustomerMessage = async (req, res) => {
  try {
    const allowedFields = [
      'status',
      'priority',
      'channel',
      'tags',
      'assignedTo',
      'orderId',
      'metadata',
      'customerPhone',
      'customerAvatar',
      'subject',
      'message',
    ]

    const update = {}
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field]
      }
    })

    const message = await CustomerMessage.findByIdAndUpdate(
      req.params.id,
      { $set: update, lastActivity: new Date() },
      { new: true, runValidators: true },
    )

    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' })
    }

    res.json({ message: 'Cập nhật tin nhắn thành công', data: message })
  } catch (error) {
    console.error('updateCustomerMessage error:', error)
    res.status(500).json({ message: 'Không thể cập nhật tin nhắn', error: error.message })
  }
}

export const replyCustomerMessage = async (req, res) => {
  try {
    const { message: replyMessage, isAdmin = true } = req.body || {}
    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' })
    }

    const reply = {
      message: replyMessage.trim(),
      senderId: req.user?._id?.toString() || '',
      senderName: req.user?.username || req.user?.email || 'Admin',
      senderRole: req.user?.role || (isAdmin ? 'admin' : 'user'),
      isAdmin,
    }

    const message = await CustomerMessage.findByIdAndUpdate(
      req.params.id,
      {
        $push: { replies: reply },
        $set: {
          status: 'in_progress',
          lastActivity: new Date(),
        },
      },
      { new: true },
    )

    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' })
    }

    res.json({ message: 'Phản hồi thành công', data: message })
  } catch (error) {
    console.error('replyCustomerMessage error:', error)
    res.status(500).json({ message: 'Không thể gửi phản hồi', error: error.message })
  }
}


