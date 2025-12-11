import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { GoStarFill } from 'react-icons/go'
import { getProductReviews, createReview, getProductReviewStats, likeReview, checkUserPurchase } from '@/apis/reviewService'
import { ToastContext } from '@/contexts/ToastProvider'
import { StoreContext } from '@/contexts/storeProvider'
import Cookies from 'js-cookie'
import Button from '@components/Button/Button'
import styles from '../styles.module.scss'

function ReviewProduct({ onReviewCountChange }) {
    const {
        reviews,
        containerReview,
        noreview,
        replyForm,
        commentReplyTitle,
        commentTotes,
        commentFormCookiesConsent,
        btnSubmit
    } = styles

    const { id: productId } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { toast } = useContext(ToastContext)
    const { userInfo } = useContext(StoreContext)
    const userId = Cookies.get('userId')

    const [reviewsList, setReviewsList] = useState([])
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [ratingFilter, setRatingFilter] = useState('all')
    const [hasPurchased, setHasPurchased] = useState(false)
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [checkingPurchase, setCheckingPurchase] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        rating: 0,
        title: '',
        comment: '',
        userName: userInfo?.username || '',
        userEmail: userInfo?.email || '',
        images: [],
        orderId: null
    })
    const [hoveredRating, setHoveredRating] = useState(0)

    useEffect(() => {
        if (productId) {
            // Always load reviews and stats (public data)
            loadReviews()
            loadStats()
            // Only check purchase status if user is logged in
            if (userId) {
                checkPurchaseStatus()
            }
        }
    }, [productId, page, ratingFilter])
    
    // Separate effect for checking purchase when userId changes
    useEffect(() => {
        if (productId && userId) {
            checkPurchaseStatus()
        }
    }, [userId, productId])

    useEffect(() => {
        if (userInfo) {
            setFormData(prev => ({
                ...prev,
                userName: userInfo.username || '',
                userEmail: userInfo.email || ''
            }))
        }
    }, [userInfo])

    const checkPurchaseStatus = async () => {
        if (!userId || !productId) return
        try {
            setCheckingPurchase(true)
            const res = await checkUserPurchase(productId)
            setHasPurchased(res.data?.hasPurchased || false)
            setPurchaseOrders(res.data?.orders || [])
            
            // Auto-select order from query params if available
            const orderIdFromQuery = searchParams.get('orderId')
            if (orderIdFromQuery && res.data?.orders?.some(o => o.orderId === orderIdFromQuery)) {
                setFormData(prev => ({ ...prev, orderId: orderIdFromQuery }))
            } else if (res.data?.orders?.length > 0 && !formData.orderId) {
                // Auto-select first order if available
                setFormData(prev => ({ ...prev, orderId: res.data.orders[0].orderId }))
            }
        } catch (error) {
            console.error('Error checking purchase:', error)
            setHasPurchased(false)
        } finally {
            setCheckingPurchase(false)
        }
    }

    const loadReviews = async () => {
        try {
            setLoading(true)
            const params = { page, limit: 10, status: 'approved' }
            if (ratingFilter !== 'all') params.rating = ratingFilter

            const res = await getProductReviews(productId, params)
            setReviewsList(res.data?.data || [])
            setTotalPages(res.data?.pagination?.pages || 1)
            if (onReviewCountChange) {
                onReviewCountChange(res.data?.pagination?.total || 0)
            }
        } catch (error) {
            console.error('Error loading reviews:', error)
            toast.error('Không thể tải đánh giá')
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const res = await getProductReviewStats(productId)
            const statsData = res.data || stats
            setStats(statsData)
            if (onReviewCountChange) {
                onReviewCountChange(statsData.totalReviews || 0)
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }))
    }

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        const imagePromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target.result)
                reader.readAsDataURL(file)
            })
        })

        Promise.all(imagePromises).then(images => {
            setFormData(prev => ({ ...prev, images: [...prev.images, ...images] }))
        })
    }

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.rating || formData.rating === 0) {
            toast.error('Vui lòng chọn điểm đánh giá')
            return
        }

        if (!formData.comment.trim()) {
            toast.error('Vui lòng nhập đánh giá')
            return
        }

        if (!formData.userName.trim()) {
            toast.error('Vui lòng nhập tên')
            return
        }

        if (!formData.userEmail.trim()) {
            toast.error('Vui lòng nhập email')
            return
        }

        if (!userId) {
            toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
            return
        }

        if (!hasPurchased) {
            toast.error('Bạn chỉ có thể đánh giá sản phẩm đã mua và đã được giao hàng')
            return
        }

        // Check if token exists
        const token = Cookies.get('token')
        if (!token) {
            toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
            navigate('/login')
            return
        }

        try {
            setSubmitting(true)
            console.log('Submitting review with token:', token ? 'exists' : 'missing')
            // Don't send userId - it will be taken from auth token by backend
            await createReview(productId, {
                userName: formData.userName,
                userEmail: formData.userEmail,
                rating: formData.rating,
                title: formData.title,
                comment: formData.comment,
                images: formData.images,
                orderId: formData.orderId
            })

            toast.success('Đánh giá đã được gửi! Cảm ơn bạn đã đánh giá sản phẩm.')
            setFormData({
                rating: 0,
                title: '',
                comment: '',
                userName: userInfo?.username || '',
                userEmail: userInfo?.email || '',
                images: []
            })
            setHoveredRating(0)
            await loadReviews()
            await loadStats()
        } catch (error) {
            const message = error?.response?.data?.message || 'Không thể gửi đánh giá'
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleLikeReview = async (reviewId) => {
        if (!userId) {
            toast.error('Vui lòng đăng nhập để thích đánh giá')
            return
        }

        try {
            await likeReview(reviewId)
            await loadReviews()
        } catch (error) {
            console.error('Error liking review:', error)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const renderStars = (rating, size = 16, interactive = false, onRatingClick = null, hovered = 0) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <GoStarFill
                        key={star}
                        style={{
                            color: star <= (hovered || rating) ? '#ffc107' : '#e1e1e1',
                            fontSize: `${size}px`,
                            cursor: interactive ? 'pointer' : 'default',
                            transition: 'color 0.2s'
                        }}
                        onClick={() => interactive && onRatingClick && onRatingClick(star)}
                        onMouseEnter={() => interactive && setHoveredRating(star)}
                        onMouseLeave={() => interactive && setHoveredRating(0)}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className={containerReview}>
            <div className={reviews}>REVIEWS</div>

            {/* Statistics */}
            {stats.totalReviews > 0 && (
                <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                            {stats.averageRating.toFixed(1)}
                        </div>
                        <div>
                            {renderStars(stats.averageRating, 24)}
                            <div style={{ marginTop: '5px', color: '#666' }}>
                                {stats.totalReviews} đánh giá
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = stats.ratingDistribution[rating] || 0
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                            return (
                                <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '60px' }}>{rating} sao</span>
                                    <div style={{ flex: 1, height: '8px', background: '#e1e1e1', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percentage}%`, height: '100%', background: '#ffc107' }} />
                                    </div>
                                    <span style={{ width: '40px', textAlign: 'right', fontSize: '14px', color: '#666' }}>
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Filter */}
            {stats.totalReviews > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <select
                        value={ratingFilter}
                        onChange={(e) => {
                            setRatingFilter(e.target.value)
                            setPage(1)
                        }}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="all">Tất cả đánh giá</option>
                        <option value="5">5 sao</option>
                        <option value="4">4 sao</option>
                        <option value="3">3 sao</option>
                        <option value="2">2 sao</option>
                        <option value="1">1 sao</option>
                    </select>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
            ) : reviewsList.length === 0 ? (
                <p className={noreview}>Chưa có đánh giá nào.</p>
            ) : (
                <div style={{ marginBottom: '40px' }}>
                    {reviewsList.map((review) => (
                        <div
                            key={review._id || review.id}
                            style={{
                                padding: '20px',
                                borderBottom: '1px solid #e1e1e1',
                                marginBottom: '20px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                        {review.userName}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        {renderStars(review.rating, 16)}
                                        <span style={{ fontSize: '14px', color: '#666' }}>
                                            {formatDate(review.createdAt)}
                                        </span>
                                        {review.verifiedPurchase && (
                                            <span style={{ fontSize: '12px', color: '#28a745', background: '#d4edda', padding: '2px 8px', borderRadius: '4px' }}>
                                                Đã mua hàng
                                            </span>
                                        )}
                                    </div>
                                    {review.title && (
                                        <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                                            {review.title}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                                {review.comment}
                            </div>
                            {review.images && review.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    {review.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Review ${idx + 1}`}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(img, '_blank')}
                                        />
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px', color: '#666' }}>
                                <button
                                    onClick={() => handleLikeReview(review._id || review.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    👍 Hữu ích ({review.helpful || 0})
                                </button>
                            </div>
                            {review.reply && review.reply.message && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '4px',
                                    borderLeft: '3px solid #007bff'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#007bff' }}>
                                        Phản hồi từ cửa hàng:
                                    </div>
                                    <div>{review.reply.message}</div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ddd',
                                    background: page === 1 ? '#f5f5f5' : 'white',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                                    borderRadius: '4px'
                                }}
                            >
                                Trước
                            </button>
                            <span style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ddd',
                                    background: page === totalPages ? '#f5f5f5' : 'white',
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                    borderRadius: '4px'
                                }}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Review Form */}
            {!userId ? (
                <div className={replyForm} style={{ padding: '20px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Vui lòng đăng nhập để đánh giá sản phẩm
                    </p>
                    <Button
                        content="Đăng nhập"
                        onClick={() => navigate('/login')}
                    />
                </div>
            ) : checkingPurchase ? (
                <div className={replyForm} style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Đang kiểm tra...</p>
                </div>
            ) : !hasPurchased ? (
                <div className={replyForm} style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    <p style={{ marginBottom: '15px', color: '#856404' }}>
                        Bạn chỉ có thể đánh giá sản phẩm đã mua và đã được giao hàng
                    </p>
                    <Button
                        content="Xem đơn hàng của tôi"
                        onClick={() => navigate('/orders')}
                    />
                </div>
            ) : (
            <div className={replyForm}>
                <div className={commentReplyTitle}>
                        VIẾT ĐÁNH GIÁ
                </div>

                <p className={commentTotes}>
                        Email của bạn sẽ không được công khai. Các trường bắt buộc được đánh dấu *
                    </p>

                    {purchaseOrders.length > 1 && (
                        <div style={{ marginBottom: '20px', padding: '10px', background: '#e7f3ff', borderRadius: '4px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Chọn đơn hàng đánh giá:
                            </label>
                            <select
                                value={formData.orderId || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            >
                                {purchaseOrders.map((order) => (
                                    <option key={order.orderId} value={order.orderId}>
                                        Đơn hàng #{order.orderId.slice(-6)} - {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                    {/* RATING */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
                            Đánh giá của bạn <span style={{ color: 'red' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {renderStars(formData.rating, 24, true, handleRatingClick, hoveredRating)}
                            {formData.rating > 0 && (
                                <span style={{ marginLeft: '10px', color: '#666' }}>
                                    {formData.rating} sao
                                </span>
                            )}
                        </div>
                    </div>

                    {/* TITLE */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Tiêu đề (tùy chọn)
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={handleInputChange('title')}
                            placeholder="Tóm tắt đánh giá của bạn"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    {/* COMMENT */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Đánh giá của bạn <span style={{ color: 'red' }}>*</span>
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={handleInputChange('comment')}
                            rows={6}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* IMAGES */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Hình ảnh (tùy chọn)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            style={{ marginBottom: '10px' }}
                        />
                        {formData.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                        <img
                                            src={img}
                                            alt={`Preview ${idx + 1}`}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* NAME */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Tên <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.userName}
                            onChange={handleInputChange('userName')}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    {/* EMAIL */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Email <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.userEmail}
                            onChange={handleInputChange('userEmail')}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <div className={commentFormCookiesConsent}>
                        <input type='checkbox' />
                        <span>
                            Lưu tên, email của tôi trong trình duyệt này cho lần bình luận tiếp theo.
                        </span>
                    </div>

                    <div className={btnSubmit}>
                        <Button
                            content={submitting ? 'Đang gửi...' : 'GỬI ĐÁNH GIÁ'}
                            onClick={handleSubmit}
                            disabled={submitting}
                        />
                    </div>
                </form>
            </div>
            )}
        </div>
    )
}

export default ReviewProduct
