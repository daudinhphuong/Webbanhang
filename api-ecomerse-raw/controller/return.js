import Return from '../models/Return.js'
import Order from '../models/Order.js'

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100)
  return { page, limit }
}

const buildReturnFilters = (query) => {
  const filters = {}
  if (query.status && query.status !== 'all') filters.status = query.status
  if (query.returnType && query.returnType !== 'all') filters.returnType = query.returnType
  if (query.orderId) filters.orderId = query.orderId
  if (query.userId) filters.userId = query.userId

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i')
    filters.$or = [
      { returnNumber: searchRegex },
      { orderId: searchRegex },
      { customerName: searchRegex },
      { customerEmail: searchRegex },
      { trackingNumber: searchRegex }
    ]
  }

  return filters
}

const getReturnStats = async () => {
  const [
    total,
    requested,
    approved,
    processing,
    completed,
    rejected,
    totalRefundAmount
  ] = await Promise.all([
    Return.countDocuments(),
    Return.countDocuments({ status: 'requested' }),
    Return.countDocuments({ status: 'approved' }),
    Return.countDocuments({ status: 'processing' }),
    Return.countDocuments({ status: 'completed' }),
    Return.countDocuments({ status: 'rejected' }),
    Return.aggregate([
      { $match: { status: { $in: ['completed', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$refundAmount' } } }
    ])
  ])

  return {
    totalReturns: total,
    requestedReturns: requested,
    approvedReturns: approved,
    processingReturns: processing,
    completedReturns: completed,
    rejectedReturns: rejected,
    totalRefundAmount: totalRefundAmount.length > 0 ? totalRefundAmount[0].total : 0
  }
}

// Get all returns (admin)
export const getAllReturns = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query)
    const filters = buildReturnFilters(req.query)
    const sort = req.query.sort || '-createdAt'

    const [returns, totalFiltered, stats] = await Promise.all([
      Return.find(filters)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Return.countDocuments(filters),
      getReturnStats()
    ])

    // Import User model
    const User = (await import('../models/User.js')).default

    // Enrich returns with user information
    const enrichedReturns = await Promise.all(returns.map(async (r) => {
      let userInfo = null
      let customerName = r.customerName

      // Always fetch user information if userId exists
      if (r.userId) {
        try {
          const user = await User.findById(r.userId).select('username name email')
          if (user) {
            userInfo = {
              _id: user._id,
              username: user.username || user.name,
              name: user.name || user.username,
              email: user.email,
            }
            // Always prefer user's name from User model over customerName
            // Only use customerName if user doesn't have name/username
            if (user.name || user.username) {
              customerName = user.name || user.username
            } else if (!customerName || customerName === r.userId || customerName.length === 24) {
              customerName = customerName || r.userId
            }
          }
        } catch (err) {
          console.error(`Error fetching user ${r.userId}:`, err)
        }
      }

      return {
        ...r,
        user: userInfo,
        customerName: customerName || r.userId || 'N/A', // Fallback to userId if no name available
      }
    }))

    res.json({
      data: enrichedReturns,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        pages: Math.ceil(totalFiltered / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Get all returns error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách đơn trả hàng', error: error.message })
  }
}

// Get return by ID
export const getReturnById = async (req, res) => {
  try {
    const returnItem = await Return.findById(req.params.id).lean()
    
    if (!returnItem) {
      return res.status(404).json({ message: 'Không tìm thấy đơn trả hàng' })
    }
    
    // Enrich with user information if available
    if (returnItem.userId) {
      try {
        const User = (await import('../models/User.js')).default
        const user = await User.findById(returnItem.userId).select('username name email')
        if (user) {
          returnItem.user = {
            _id: user._id,
            username: user.username || user.name,
            name: user.name || user.username,
            email: user.email,
          }
          // Always prefer user's name from User model over customerName
          if (user.name || user.username) {
            returnItem.customerName = user.name || user.username
          } else if (!returnItem.customerName || returnItem.customerName === returnItem.userId) {
            returnItem.customerName = returnItem.customerName || returnItem.userId
          }
        }
      } catch (err) {
        console.error(`Error fetching user ${returnItem.userId}:`, err)
      }
    }
    res.json(returnItem)
  } catch (error) {
    console.error('Get return by ID error:', error)
    res.status(500).json({ message: 'Không thể lấy thông tin đơn trả hàng', error: error.message })
  }
}

// Get user's returns
export const getUserReturns = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { page, limit } = parsePagination(req.query)
    const filters = { userId: user._id.toString() }
    if (req.query.status && req.query.status !== 'all') {
      filters.status = req.query.status
    }

    const [returns, total] = await Promise.all([
      Return.find(filters)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Return.countDocuments(filters)
    ])

    res.json({
      data: returns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get user returns error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách đơn trả hàng', error: error.message })
  }
}

// Create return request (user or admin)
export const createReturn = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const {
      orderId,
      returnType,
      reason,
      description,
      items,
      images,
      refundAmount,
      customerName,
      customerEmail,
      customerPhone
    } = req.body

    if (!orderId || !returnType || !reason) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
    }

    // Verify order exists
    const order = await Order.findOne({ _id: orderId })
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    // If admin creating return, use provided customer info or order info
    // If user creating return, verify order belongs to user
    const isAdmin = user.isAdmin === true || user.role === 'admin'
    if (!isAdmin && order.userId !== user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền trả hàng cho đơn này' })
    }

    // Check if order is eligible for return (delivered, not cancelled)
    if (order.status !== 'delivered' && !isAdmin) {
      return res.status(400).json({ 
        message: 'Chỉ có thể trả hàng cho đơn hàng đã được giao' 
      })
    }

    // Normalize items
    let normalizedItems = []
    if (items && Array.isArray(items) && items.length > 0) {
      normalizedItems = items
        .map((item) => {
          const orderItem = order.items.find((oi) => oi.productId === item.productId)
          if (!orderItem) return null
          const quantity = Math.min(item.quantity || orderItem.quantity, orderItem.quantity)
          return {
            productId: orderItem.productId,
            productName: item.productName || '',
            quantity,
            price: orderItem.price,
            reason: item.reason || '',
          }
        })
        .filter(Boolean)
    } else {
      normalizedItems = order.items.map((item) => ({
        productId: item.productId,
        productName: '',
        quantity: item.quantity,
        price: item.price,
        reason: '',
      }))
    }

    if (!normalizedItems.length) {
      return res.status(400).json({ message: 'Không có sản phẩm hợp lệ để trả hàng' })
    }

    // Calculate refund amount if not provided
    let calculatedRefundAmount = refundAmount || 0
    if (!refundAmount) {
      calculatedRefundAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      if (!calculatedRefundAmount) {
        calculatedRefundAmount = order.finalAmount || order.totalAmount || 0
      }
    }

    // Create return
    const returnData = {
      orderId,
      userId: isAdmin ? (req.body.userId || order.userId) : user._id.toString(),
      customerName: customerName || `${order.firstName} ${order.lastName}`,
      customerEmail: customerEmail || order.email,
      customerPhone: customerPhone || order.phone,
      returnType,
      reason,
      description: description || '',
      items: normalizedItems,
      refundAmount: calculatedRefundAmount,
      images: images || [],
      returnAddress: {
        street: order.street,
        city: order.cities,
        state: order.state,
        zipCode: order.zipCode,
        country: order.country
      }
    }

    const returnItem = await Return.create(returnData)

    res.status(201).json({
      success: true,
      message: 'Yêu cầu trả hàng đã được tạo thành công',
      data: returnItem
    })
  } catch (error) {
    console.error('Create return error:', error)
    res.status(500).json({ message: 'Không thể tạo yêu cầu trả hàng', error: error.message })
  }
}

// Update return status (admin)
export const updateReturnStatus = async (req, res) => {
  try {
    const { status, adminNotes, assignedTo } = req.body
    const returnId = req.params.id

    const returnItem = await Return.findById(returnId)
    if (!returnItem) {
      return res.status(404).json({ message: 'Không tìm thấy đơn trả hàng' })
    }

    const updateData = {}
    if (status) {
      updateData.status = status
      if (status === 'approved' && !returnItem.approvedAt) {
        updateData.approvedAt = new Date()
      }
      if (status === 'completed' && !returnItem.completedAt) {
        updateData.completedAt = new Date()
      }
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (assignedTo) updateData.assignedTo = assignedTo

    const updated = await Return.findByIdAndUpdate(
      returnId,
      { $set: updateData },
      { new: true }
    )

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updated
    })
  } catch (error) {
    console.error('Update return status error:', error)
    res.status(500).json({ message: 'Không thể cập nhật trạng thái', error: error.message })
  }
}

// Process refund (admin)
export const processRefund = async (req, res) => {
  try {
    const { refundId, method, transactionId, notes } = req.body
    const returnId = req.params.id

    const returnItem = await Return.findById(returnId)
    if (!returnItem) {
      return res.status(404).json({ message: 'Không tìm thấy đơn trả hàng' })
    }

    if (returnItem.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Chỉ có thể xử lý hoàn tiền cho đơn đã được duyệt' 
      })
    }

    const refund = {
      refundId: refundId || `REF${Date.now()}`,
      amount: returnItem.refundAmount,
      method: method || 'original',
      status: 'processing',
      transactionId: transactionId || '',
      notes: notes || '',
      processedAt: new Date()
    }

    const updated = await Return.findByIdAndUpdate(
      returnId,
      { 
        $set: { 
          refund,
          status: 'processing'
        }
      },
      { new: true }
    )

    res.json({
      success: true,
      message: 'Hoàn tiền đang được xử lý',
      data: updated
    })
  } catch (error) {
    console.error('Process refund error:', error)
    res.status(500).json({ message: 'Không thể xử lý hoàn tiền', error: error.message })
  }
}

// Complete refund (admin)
export const completeRefund = async (req, res) => {
  try {
    const returnId = req.params.id
    const { transactionId } = req.body

    const returnItem = await Return.findById(returnId)
    if (!returnItem) {
      return res.status(404).json({ message: 'Không tìm thấy đơn trả hàng' })
    }

    if (!returnItem.refund) {
      return res.status(400).json({ message: 'Chưa có thông tin hoàn tiền' })
    }

    const updated = await Return.findByIdAndUpdate(
      returnId,
      { 
        $set: { 
          'refund.status': 'completed',
          'refund.transactionId': transactionId || returnItem.refund.transactionId,
          status: 'completed',
          completedAt: new Date()
        }
      },
      { new: true }
    )

    res.json({
      success: true,
      message: 'Hoàn tiền đã hoàn tất',
      data: updated
    })
  } catch (error) {
    console.error('Complete refund error:', error)
    res.status(500).json({ message: 'Không thể hoàn tất hoàn tiền', error: error.message })
  }
}

// Get orders eligible for return (for user)
export const getEligibleOrders = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get delivered orders that haven't been returned
    const deliveredOrders = await Order.find({
      userId: user._id.toString(),
      status: 'delivered'
    }).sort('-createdAt').lean()

    // Get existing returns
    const existingReturns = await Return.find({
      userId: user._id.toString(),
      status: { $nin: ['rejected', 'cancelled'] }
    }).select('orderId').lean()

    const returnedOrderIds = new Set(existingReturns.map(r => r.orderId))

    const eligibleOrders = deliveredOrders
      .filter(order => !returnedOrderIds.has(order._id.toString()))
      .map(order => ({
        _id: order._id,
        orderNumber: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        finalAmount: order.finalAmount,
        status: order.status,
        deliveredAt: order.updatedAt,
        createdAt: order.createdAt
      }))

    res.json({
      data: eligibleOrders
    })
  } catch (error) {
    console.error('Get eligible orders error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách đơn hàng', error: error.message })
  }
}

