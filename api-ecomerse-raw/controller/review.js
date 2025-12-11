import mongoose from 'mongoose'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import User from '../models/User.js'

// Get all reviews for admin (with filters and pagination)
export const getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      rating, 
      productId, 
      search,
      sort = '-createdAt' 
    } = req.query

    const filters = {}
    if (status && status !== 'all') filters.status = status
    if (rating) filters.rating = parseInt(rating)
    if (productId && productId !== 'all') filters.productId = productId

    // Search in userName, userEmail, title, comment
    if (search) {
      filters.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const reviews = await Review.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    const total = await Review.countDocuments(filters)

    // Get product names for reviews
    const productIds = [...new Set(reviews.map(r => r.productId).filter(Boolean))]
    let products = []
    if (productIds.length > 0) {
      // productId is stored as string (UUID), so we need to find products by _id as string
      products = await Product.find({
        _id: { $in: productIds }
      })
        .select('_id name images')
        .lean()
    }
    
    const productMap = {}
    products.forEach(p => {
      // Map by both _id (ObjectId) and _id as string (UUID) to handle both cases
      const idStr = p._id.toString()
      productMap[p._id] = {
        name: p.name,
        image: p.images?.[0] || ''
      }
      productMap[idStr] = {
        name: p.name,
        image: p.images?.[0] || ''
      }
    })

    // Enrich reviews with product info
    const enrichedReviews = reviews.map(review => {
      const productInfo = productMap[review.productId] || {}
      return {
        ...review,
        productName: productInfo.name || 'Unknown Product',
        productImage: productInfo.image || '',
        isVerified: review.verifiedPurchase || false,
        adminResponse: review.reply?.message || null
      }
    })

    res.json({
      data: enrichedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('getAllReviews error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách đánh giá', error: error.message })
  }
}

// Get all products for filter dropdown
export const getProductsForFilter = async (req, res) => {
  try {
    const products = await Product.find({})
      .select('_id name')
      .lean()
    
    res.json({ data: products })
  } catch (error) {
    console.error('getProductsForFilter error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách sản phẩm', error: error.message })
  }
}

// Get product rating statistics for admin (all products)
export const getAllProductRatingStats = async (req, res) => {
  try {
    const { categoryFilter, ratingFilter, search } = req.query

    // Get all products with reviews
    const productsWithReviews = await Review.aggregate([
      {
        $group: {
          _id: '$productId',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          },
          verifiedReviews: {
            $sum: { $cond: ['$verifiedPurchase', 1, 0] }
          },
          lastReviewDate: { $max: '$createdAt' }
        }
      }
    ])

    // Get product details
    const productIds = productsWithReviews.map(p => p._id).filter(Boolean)
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name images category price')
      .lean()

    const productMap = {}
    products.forEach(p => {
      const idStr = p._id.toString()
      productMap[p._id] = p
      productMap[idStr] = p
    })

    // Calculate rating distribution for each product
    const stats = productsWithReviews.map(stat => {
      const product = productMap[stat._id] || {}
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      stat.ratingDistribution.forEach(rating => {
        if (rating >= 1 && rating <= 5) {
          distribution[rating] = (distribution[rating] || 0) + 1
        }
      })

      // Count recent reviews (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentCount = stat.ratingDistribution.filter((_, idx) => {
        // We need to get actual review dates, so we'll query separately
        return true // Placeholder
      }).length

      return {
        productId: stat._id,
        productName: product.name || 'Unknown Product',
        productImage: product.images?.[0] || '',
        category: product.category || 'Uncategorized',
        price: product.price || 0,
        totalReviews: stat.totalReviews,
        averageRating: Math.round(stat.averageRating * 10) / 10,
        ratingDistribution: distribution,
        verifiedReviews: stat.verifiedReviews,
        lastReviewDate: stat.lastReviewDate,
        recentReviews: 0 // Will be updated later
      }
    })

    // Apply filters
    let filteredStats = stats
    if (categoryFilter && categoryFilter !== 'all') {
      filteredStats = filteredStats.filter(s => s.category === categoryFilter)
    }
    if (ratingFilter && ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter)
      filteredStats = filteredStats.filter(s => s.averageRating >= minRating)
    }
    if (search) {
      filteredStats = filteredStats.filter(s => 
        s.productName.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Get recent reviews count for each product
    const recentReviewsCounts = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 }
        }
      }
    ])

    const recentMap = {}
    recentReviewsCounts.forEach(r => {
      recentMap[r._id] = r.count
    })

    filteredStats = filteredStats.map(stat => ({
      ...stat,
      recentReviews: recentMap[stat.productId] || 0
    }))

    res.json({ data: filteredStats })
  } catch (error) {
    console.error('getProductRatingStats error:', error)
    res.status(500).json({ message: 'Không thể lấy thống kê đánh giá', error: error.message })
  }
}

// Get negative reviews report (rating <= 2)
export const getNegativeReviewsReport = async (req, res) => {
  try {
    const { severityFilter, productFilter, dateFilter, search } = req.query

    // Calculate date range
    const days = parseInt(dateFilter) || 30
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Build filters
    const filters = {
      rating: { $lte: 2 },
      createdAt: { $gte: dateFrom }
    }

    if (productFilter && productFilter !== 'all') {
      filters.productId = productFilter
    }

    // Search in title and comment
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ]
    }

    const reviews = await Review.find(filters)
      .sort({ createdAt: -1 })
      .lean()

    // Get product details
    const productIds = [...new Set(reviews.map(r => r.productId).filter(Boolean))]
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name images')
      .lean()

    const productMap = {}
    products.forEach(p => {
      const idStr = p._id.toString()
      productMap[p._id] = p
      productMap[idStr] = p
    })

    // Categorize by severity
    const categorizeSeverity = (rating, comment) => {
      if (rating === 1) return 'critical'
      if (rating === 2 && (comment.includes('lỗi') || comment.includes('hỏng') || comment.includes('không hoạt động'))) {
        return 'high'
      }
      return 'medium'
    }

    // Enrich reviews with product info and severity
    const enrichedReviews = reviews.map(review => {
      const product = productMap[review.productId] || {}
      const severity = categorizeSeverity(review.rating, review.comment)
      
      return {
        ...review,
        productName: product.name || 'Unknown Product',
        productImage: product.images?.[0] || '',
        severity,
        category: review.rating === 1 ? 'product_defect' : 'product_quality',
        isVerified: review.verifiedPurchase || false,
        adminResponse: review.reply?.message || null,
        impact: review.rating === 1 ? 'high' : 'medium'
      }
    })

    // Apply severity filter
    let filteredReviews = enrichedReviews
    if (severityFilter && severityFilter !== 'all') {
      filteredReviews = filteredReviews.filter(r => r.severity === severityFilter)
    }

    res.json({ data: filteredReviews })
  } catch (error) {
    console.error('getNegativeReviewsReport error:', error)
    res.status(500).json({ message: 'Không thể lấy báo cáo đánh giá tiêu cực', error: error.message })
  }
}

// Update review status (approve/reject) - Admin only
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'approved', 'rejected', 'spam'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!review) {
      return res.status(404).json({ message: 'Đánh giá không tồn tại' })
    }

    res.json({ message: 'Trạng thái đánh giá đã được cập nhật', data: review })
  } catch (error) {
    console.error('updateReviewStatus error:', error)
    res.status(500).json({ message: 'Không thể cập nhật trạng thái', error: error.message })
  }
}

// Add admin reply to review
export const addAdminReply = async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body
    let adminId = req.user?._id

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập phản hồi' })
    }

    if (!adminId) {
      return res.status(401).json({ message: 'Bạn không có quyền thực hiện thao tác này' })
    }

    // Handle case where adminId is string "admin" (from hardcoded admin bypass)
    // Try to find a real admin user in the database
    if (adminId === 'admin' || (typeof adminId === 'string' && adminId === 'admin')) {
      const adminUser = await User.findOne({ 
        $or: [
          { isAdmin: true },
          { role: 'admin' }
        ]
      })
      if (adminUser) {
        adminId = adminUser._id
      } else {
        // If no admin user found, keep the string "admin" (will work with Mixed type)
        adminId = 'admin'
      }
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        reply: {
          message: message.trim(),
          repliedBy: adminId,
          repliedAt: new Date()
        }
      },
      { new: true }
    )

    if (!review) {
      return res.status(404).json({ message: 'Đánh giá không tồn tại' })
    }

    res.json({ message: 'Phản hồi đã được thêm', data: review })
  } catch (error) {
    console.error('addAdminReply error:', error)
    res.status(500).json({ message: 'Không thể thêm phản hồi', error: error.message })
  }
}

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    console.log('getProductReviews called with productId:', productId)
    const { page = 1, limit = 10, rating, status = 'approved', sort = '-createdAt' } = req.query

    const filters = { productId, status }
    if (rating) filters.rating = parseInt(rating)

    const skip = (parseInt(page) - 1) * parseInt(limit)
    // Don't populate userId since it's now a String, not ObjectId
    const reviews = await Review.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    const total = await Review.countDocuments(filters)

    // Calculate statistics
    const stats = await Review.aggregate([
      { $match: { productId: productId, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ])

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(r => {
        ratingDist[r] = (ratingDist[r] || 0) + 1
      })
    }

    res.json({
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        averageRating: stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0,
        totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
        ratingDistribution: ratingDist
      }
    })
  } catch (error) {
    console.error('getProductReviews error:', error)
    res.status(500).json({ message: 'Không thể lấy danh sách đánh giá', error: error.message })
  }
}

// Get review statistics for a product
export const getProductReviewStats = async (req, res) => {
  try {
    const { productId } = req.params
    console.log('getProductReviewStats called with productId:', productId)

    const stats = await Review.aggregate([
      { $match: { productId: productId, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ])

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(r => {
        ratingDist[r] = (ratingDist[r] || 0) + 1
      })
    }

    res.json({
      averageRating: stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0,
      totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
      ratingDistribution: ratingDist
    })
  } catch (error) {
    console.error('getProductReviewStats error:', error)
    res.status(500).json({ message: 'Không thể lấy thống kê đánh giá', error: error.message })
  }
}

// Check if user has purchased a product
export const checkUserPurchase = async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user?._id || req.body.userId

    console.log('checkUserPurchase - productId:', productId, 'userId:', userId, 'req.user:', req.user)

    if (!userId) {
      console.log('checkUserPurchase - No userId found')
      return res.json({ hasPurchased: false, orders: [] })
    }

    // Convert userId to string for comparison (Order.userId is String)
    const userIdStr = userId.toString()

    // Find orders where user has purchased this product
    // Allow reviews for orders that are paid/completed/delivered (not pending or cancelled)
    const orders = await Order.find({
      $or: [
        { userId: userIdStr },
        { userId: userId }
      ],
      status: { $in: ['delivered', 'paid', 'completed', 'processing', 'shipped'] },
      'items.productId': productId
    }).select('_id createdAt items status userId').lean()

    console.log('checkUserPurchase - found orders:', orders.length)

    const purchaseInfo = orders.map(order => {
      const item = order.items.find(item => item.productId === productId)
      return {
        orderId: order._id,
        orderDate: order.createdAt,
        quantity: item?.quantity || 0,
        status: order.status
      }
    })

    res.json({
      hasPurchased: purchaseInfo.length > 0,
      orders: purchaseInfo
    })
  } catch (error) {
    console.error('checkUserPurchase error:', error)
    res.status(500).json({ message: 'Không thể kiểm tra thông tin mua hàng', error: error.message })
  }
}

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params
    const { userName, userEmail, rating, title, comment, images = [], orderId } = req.body
    
    // Get userId from authenticated user (from middleware)
    const userId = req.user?._id
    console.log('createReview - productId:', productId)
    console.log('createReview - req.user:', req.user ? 'exists' : 'missing')
    console.log('createReview - userId:', userId)
    console.log('createReview - Authorization header:', req.header('Authorization') ? 'present' : 'missing')

    if (!userId) {
      console.log('createReview - No userId found, returning 401')
      return res.status(401).json({ message: 'Vui lòng đăng nhập để đánh giá sản phẩm' })
    }

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating và comment là bắt buộc' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1 đến 5' })
    }

    // Check if product exists (productId can be String/UUID)
    const product = await Product.findOne({ _id: productId }) || await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }

    // REQUIRE: User must have purchased the product to review
    // Check if user has purchased this product
    // Allow reviews for orders that are paid/completed/delivered (not pending or cancelled)
    const userIdStr = userId.toString()
    const order = await Order.findOne({
      $or: [
        { userId: userIdStr },
        { userId: userId }
      ],
      status: { $in: ['delivered', 'paid', 'completed', 'processing', 'shipped'] },
      'items.productId': productId,
      ...(orderId ? { _id: orderId } : {})
    })

    console.log('createReview - order found:', order ? 'yes' : 'no')

    if (!order) {
      return res.status(403).json({ 
        message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã được thanh toán' 
      })
    }

    // Use the orderId from the found order if not provided
    const validOrderId = orderId || order._id

    // Check if user already reviewed this product for this order
    // Convert orderId to string for comparison
    const orderIdStr = validOrderId ? validOrderId.toString() : null
    
    // Build query without orderId first to avoid casting issues
    const existingReviewQuery = { 
      productId, 
      userId: userIdStr, 
      status: { $ne: 'rejected' } 
    }
    
    // Only add orderId if it exists and is valid
    if (orderIdStr) {
      existingReviewQuery.orderId = orderIdStr
    }
    
    const existingReview = await Review.findOne(existingReviewQuery)
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi' })
    }

    // userId is already a string (UUID), use it directly
    const review = await Review.create({
      productId,
      userId: userIdStr, // Use string userId
      userName: userName || req.user?.username || 'Anonymous',
      userEmail: userEmail || req.user?.email || '',
      rating,
      title: title || '',
      comment,
      images,
      orderId: orderIdStr, // Use string orderId
      verifiedPurchase: true,
      status: 'approved' // Auto-approve if user is logged in and has purchased
    })

    console.log('createReview - review created:', review._id)
    res.status(201).json({ message: 'Đánh giá đã được gửi', data: review })
  } catch (error) {
    console.error('createReview error:', error)
    console.error('createReview error stack:', error.stack)
    res.status(500).json({ message: 'Không thể tạo đánh giá', error: error.message })
  }
}

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, title, comment, images } = req.body

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ message: 'Đánh giá không tồn tại' })
    }

    // Check if user owns this review
    if (req.user && review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa đánh giá này' })
    }

    const update = {}
    if (rating !== undefined) update.rating = rating
    if (title !== undefined) update.title = title
    if (comment !== undefined) update.comment = comment
    if (images !== undefined) update.images = images

    const updatedReview = await Review.findByIdAndUpdate(id, update, { new: true })

    res.json({ message: 'Đánh giá đã được cập nhật', data: updatedReview })
  } catch (error) {
    console.error('updateReview error:', error)
    res.status(500).json({ message: 'Không thể cập nhật đánh giá', error: error.message })
  }
}

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ message: 'Đánh giá không tồn tại' })
    }

    // Check if user owns this review or is admin
    if (req.user && review.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' })
    }

    await Review.findByIdAndDelete(id)

    res.json({ message: 'Đánh giá đã được xóa' })
  } catch (error) {
    console.error('deleteReview error:', error)
    res.status(500).json({ message: 'Không thể xóa đánh giá', error: error.message })
  }
}

// Like/Helpful a review
export const likeReview = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' })
    }

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ message: 'Đánh giá không tồn tại' })
    }

    const hasLiked = review.helpfulUsers.includes(userId)

    if (hasLiked) {
      // Unlike
      review.helpful = Math.max(0, review.helpful - 1)
      review.helpfulUsers = review.helpfulUsers.filter(id => id.toString() !== userId.toString())
    } else {
      // Like
      review.helpful += 1
      review.helpfulUsers.push(userId)
    }

    await review.save()

    res.json({ message: hasLiked ? 'Đã bỏ thích' : 'Đã thích', data: review })
  } catch (error) {
    console.error('likeReview error:', error)
    res.status(500).json({ message: 'Không thể thích đánh giá', error: error.message })
  }
}

// Report a review
export const reportReview = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const review = await Review.findByIdAndUpdate(
      id,
      { reported: true, reportReason: reason || 'Spam or inappropriate content' },
      { new: true }
    )

    if (!review) {
      return res.status(404).json({ message: 'Đánh giá không tồn tại' })
    }

    res.json({ message: 'Đã báo cáo đánh giá', data: review })
  } catch (error) {
    console.error('reportReview error:', error)
    res.status(500).json({ message: 'Không thể báo cáo đánh giá', error: error.message })
  }
}

