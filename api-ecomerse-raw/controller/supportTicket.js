import SupportTicket from '../models/SupportTicket.js'

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100)
  return { page, limit }
}

const buildTicketFilters = (query) => {
  const filters = {}
  if (query.status && query.status !== 'all') filters.status = query.status
  if (query.priority && query.priority !== 'all') filters.priority = query.priority
  if (query.category && query.category !== 'all') filters.category = query.category
  if (query.assignedTo && query.assignedTo !== 'all') filters['assignedTo.id'] = query.assignedTo

  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filters.$or = [
      { ticketNumber: regex },
      { subject: regex },
      { description: regex },
      { customerName: regex },
      { customerEmail: regex },
      { orderId: regex },
    ]
  }

  return filters
}

const generateTicketNumber = async () => {
  const prefix = 'TKT'
  const random = Math.floor(Math.random() * 900000) + 100000
  const ticketNumber = `${prefix}${random}`
  const exists = await SupportTicket.exists({ ticketNumber })
  if (exists) {
    return generateTicketNumber()
  }
  return ticketNumber
}

const getTicketStats = async () => {
  const [
    total,
    open,
    inProgress,
    resolved,
    closed,
    escalated,
    avgResolution,
    satisfaction,
    categoryStats,
    assignees,
  ] = await Promise.all([
    SupportTicket.countDocuments(),
    SupportTicket.countDocuments({ status: 'open' }),
    SupportTicket.countDocuments({ status: 'in_progress' }),
    SupportTicket.countDocuments({ status: 'resolved' }),
    SupportTicket.countDocuments({ status: 'closed' }),
    SupportTicket.countDocuments({ status: 'escalated' }),
    SupportTicket.aggregate([
      { $match: { status: { $in: ['resolved', 'closed'] } } },
      {
        $project: {
          resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
        },
      },
    ]),
    SupportTicket.aggregate([
      { $match: { satisfaction: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgSatisfaction: { $avg: '$satisfaction' },
        },
      },
    ]),
    SupportTicket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]),
    SupportTicket.aggregate([
      {
        $match: { 'assignedTo.id': { $exists: true, $ne: '' } },
      },
      {
        $group: {
          _id: '$assignedTo.id',
          name: { $first: '$assignedTo.name' },
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  return {
    totalTickets: total,
    openTickets: open,
    inProgressTickets: inProgress,
    resolvedTickets: resolved,
    closedTickets: closed,
    escalatedTickets: escalated,
    averageResolutionTimeDays:
      avgResolution.length > 0
        ? Number((avgResolution[0].avgResolutionTime / (1000 * 60 * 60 * 24)).toFixed(2))
        : 0,
    customerSatisfaction:
      satisfaction.length > 0 ? Number(satisfaction[0].avgSatisfaction.toFixed(1)) : null,
    categories: categoryStats.map((item) => ({ id: item._id, name: item._id, count: item.count })),
    assignees: assignees.map((item) => ({
      id: item._id,
      name: item.name || item._id,
      count: item.count,
    })),
  }
}

export const listSupportTickets = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query)
    const filters = buildTicketFilters(req.query)
    const sort = req.query.sort || '-createdAt'

    const [tickets, totalFiltered, stats] = await Promise.all([
      SupportTicket.find(filters)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filters),
      getTicketStats(),
    ])

    res.json({
      data: tickets,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('listSupportTickets error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách ticket', error: error.message })
  }
}

export const getSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).lean()
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy ticket' })
    }
    res.json(ticket)
  } catch (error) {
    console.error('getSupportTicket error:', error)
    res.status(500).json({ message: 'Không thể lấy ticket', error: error.message })
  }
}

export const createSupportTicket = async (req, res) => {
  try {
    const payload = req.body || {}
    if (!payload.customerName || !payload.customerEmail || !payload.subject || !payload.description) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
    }

    const ticketNumber = await generateTicketNumber()
    const dueDate =
      payload.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // default +3 days

    const ticket = await SupportTicket.create({
      ...payload,
      ticketNumber,
      dueDate,
      history: [
        {
          action: 'created',
          description: 'Ticket created',
          performedBy: {
            id: req.user?._id?.toString() || '',
            name: req.user?.username || req.user?.email || 'System',
          },
        },
      ],
    })

    res.status(201).json({ message: 'Tạo ticket thành công', data: ticket })
  } catch (error) {
    console.error('createSupportTicket error:', error)
    res.status(500).json({ message: 'Không thể tạo ticket', error: error.message })
  }
}

export const updateSupportTicket = async (req, res) => {
  try {
    const allowedFields = [
      'status',
      'priority',
      'category',
      'tags',
      'assignedTo',
      'dueDate',
      'resolution',
      'satisfaction',
      'timeSpent',
      'description',
      'subject',
      'customerPhone',
      'attachments',
      'watchers',
      'metadata',
    ]

    const update = {}
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field]
      }
    })

    const historyEntry = {
      action: 'updated',
      description: req.body.historyDescription || 'Ticket updated',
      performedBy: {
        id: req.user?._id?.toString() || '',
        name: req.user?.username || req.user?.email || 'Admin',
      },
      meta: update,
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        $set: update,
        $push: { history: historyEntry },
      },
      { new: true, runValidators: true },
    )

    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy ticket' })
    }

    res.json({ message: 'Cập nhật ticket thành công', data: ticket })
  } catch (error) {
    console.error('updateSupportTicket error:', error)
    res.status(500).json({ message: 'Không thể cập nhật ticket', error: error.message })
  }
}

export const replySupportTicket = async (req, res) => {
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

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        $push: { replies: reply, history: { action: 'reply', description: 'Reply added', performedBy: { id: reply.senderId, name: reply.senderName } } },
        $set: {
          status: req.body.updateStatus || 'in_progress',
          lastActivity: new Date(),
        },
      },
      { new: true },
    )

    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy ticket' })
    }

    res.json({ message: 'Phản hồi thành công', data: ticket })
  } catch (error) {
    console.error('replySupportTicket error:', error)
    res.status(500).json({ message: 'Không thể gửi phản hồi', error: error.message })
  }
}


