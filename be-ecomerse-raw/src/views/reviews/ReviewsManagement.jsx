import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CButton, CAlert, CRow, CCol, CFormInput, 
  CFormTextarea, CFormSelect, CSpinner, CForm, CFormLabel, CFormCheck, 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge,
  CInputGroup, CInputGroupText, CProgress, CListGroup, CListGroupItem,
  CImage, CFormTextarea as CTextarea
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const ReviewsManagement = () => {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })

  const [adminResponse, setAdminResponse] = useState('')

  const loadReviews = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(ratingFilter !== 'all' && { rating: ratingFilter }),
        ...(productFilter !== 'all' && { productId: productFilter }),
        ...(searchTerm && { search: searchTerm })
      }
      
      const res = await axiosClient.get('/admin/reviews', { params })
      setReviews(res.data?.data || [])
      setPagination(res.data?.pagination || pagination)
    } catch (e) {
      console.error('Error loading reviews:', e)
      setError('Không tải được danh sách đánh giá: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await axiosClient.get('/admin/products-for-filter')
      setProducts(res.data?.data || [])
    } catch (e) {
      console.error('Error loading products:', e)
    }
  }

  useEffect(() => { 
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, ratingFilter, productFilter, searchTerm])
  
  useEffect(() => {
    // Reload when filters or page change
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, ratingFilter, productFilter, searchTerm, pagination.page])

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      setSaving(true)
      setError('')
      await axiosClient.put(`/admin/reviews/${reviewId}/status`, { status: newStatus })
      
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, status: newStatus, updatedAt: new Date().toISOString() }
          : review
      ))
      
      setSuccess(`Đánh giá đã được ${newStatus === 'approved' ? 'duyệt' : newStatus === 'rejected' ? 'từ chối' : 'chờ duyệt'}!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error('Error updating review status:', e)
      setError('Lỗi khi cập nhật trạng thái đánh giá: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        setSaving(true)
        setError('')
        await axiosClient.delete(`/reviews/${reviewId}`)
        
        setReviews(prev => prev.filter(review => review._id !== reviewId))
        setPagination(prev => ({ ...prev, total: prev.total - 1 }))
        setSuccess('Đánh giá đã được xóa!')
        setTimeout(() => setSuccess(''), 3000)
      } catch (e) {
        console.error('Error deleting review:', e)
        setError('Lỗi khi xóa đánh giá: ' + (e.response?.data?.message || e.message))
      } finally {
        setSaving(false)
      }
    }
  }

  const handleAddAdminResponse = async (reviewId) => {
    if (!adminResponse.trim()) {
      setError('Vui lòng nhập phản hồi')
      return
    }

    try {
      setSaving(true)
      setError('')
      const response = await axiosClient.post(`/admin/reviews/${reviewId}/reply`, { message: adminResponse })
      
      // Update the review with the response data from server
      let updatedReviewData = null
      if (response.data?.data) {
        updatedReviewData = response.data.data
        setReviews(prev => prev.map(review => 
          review._id === reviewId || review.id === reviewId
            ? { 
                ...review, 
                reply: updatedReviewData.reply || {
                  message: adminResponse.trim(),
                  repliedBy: updatedReviewData.reply?.repliedBy,
                  repliedAt: updatedReviewData.reply?.repliedAt || new Date().toISOString()
                },
                updatedAt: updatedReviewData.updatedAt || new Date().toISOString()
              }
            : review
        ))
      } else {
        // Fallback: update with reply structure if response doesn't have data
        updatedReviewData = {
          reply: {
            message: adminResponse.trim(),
            repliedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        }
        setReviews(prev => prev.map(review => 
          review._id === reviewId || review.id === reviewId
            ? { 
                ...review, 
                reply: updatedReviewData.reply,
                updatedAt: updatedReviewData.updatedAt
              }
            : review
        ))
      }
      
      // Update selectedReview if it's the same review
      if (selectedReview && (selectedReview._id === reviewId || selectedReview.id === reviewId)) {
        setSelectedReview(prev => ({
          ...prev,
          reply: updatedReviewData?.reply || {
            message: adminResponse.trim(),
            repliedAt: new Date().toISOString()
          },
          updatedAt: updatedReviewData?.updatedAt || new Date().toISOString()
        }))
      }
      
      setAdminResponse('')
      setSuccess('Phản hồi đã được thêm!')
      setTimeout(() => setSuccess(''), 3000)
      
      // Reload reviews to ensure we have the latest data
      await loadReviews()
      
      // Close modal after reload
      setModalOpen(false)
    } catch (e) {
      console.error('Error adding admin response:', e)
      setError('Lỗi khi thêm phản hồi: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }

  const openReviewDetail = (review) => {
    setSelectedReview(review)
    setAdminResponse(review.reply?.message || review.adminResponse || '')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedReview(null)
    setAdminResponse('')
  }

  // Reviews are already filtered by API, no need to filter again
  const filteredReviews = reviews

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      case 'pending': return 'warning'
      default: return 'secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Đã duyệt'
      case 'rejected': return 'Từ chối'
      case 'pending': return 'Chờ duyệt'
      default: return status
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success'
    if (rating >= 3) return 'warning'
    return 'danger'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#ffc107' : '#e9ecef' }}>
        ★
      </span>
    ))
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol md={8}>
          <h2>{t('reviews.title')}</h2>
          <p className="text-muted">Quản lý đánh giá và bình luận sản phẩm</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="info" variant="outline">
            Export Reviews
          </CButton>
        </CCol>
      </CRow>

      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}
      {success && <CAlert color="success" className="mb-4">{success}</CAlert>}

      {/* Filters */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormInput
                placeholder={t('common.search') + '..."'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('common.status')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="approved">{t('reviews.approve')}</option>
                <option value="rejected">{t('reviews.reject')}</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('reviews.rating')}</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('products.title')}</option>
                {products.map(product => (
                  <option key={product._id || product.id} value={product._id || product.id}>{product.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CButton color="secondary" variant="outline" onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setRatingFilter('all')
                setProductFilter('all')
              }}>
                {t('common.reset')}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Reviews Table */}
      <CCard>
        <CCardHeader>
          <strong>{t('reviews.title')} ({pagination.total || filteredReviews.length})</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-5 text-muted">Không có đánh giá nào</div>
          ) : (
            <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>{t('products.title')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('users.customer')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('reviews.rating')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('reviews.review')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.status')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.date')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.actions')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredReviews.map((review) => (
                  <CTableRow key={review._id || review.id}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <CImage
                          src={review.productImage}
                          alt={review.productName}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          className="me-2"
                        />
                      <div>
                        <div style={{ fontWeight: 500 }}>{review.productName || 'Unknown Product'}</div>
                        <small className="text-muted">ID: {review.productId?.slice(-8) || review.productId}</small>
                      </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{review.userName || review.customerName}</div>
                        <small className="text-muted">{review.userEmail || review.customerEmail}</small>
                        {review.verifiedPurchase && (
                          <CBadge color="success" className="ms-1">Verified</CBadge>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontSize: '16px' }}>{renderStars(review.rating)}</div>
                        <small className="text-muted">{review.rating}/5</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{review.title || '(Không có tiêu đề)'}</div>
                        <div style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {review.comment}
                        </div>
                        {review.images && review.images.length > 0 && (
                          <small className="text-info">{review.images.length} ảnh</small>
                        )}
                        {(review.reply?.message || review.adminResponse) && (
                          <div className="mt-1">
                            <small className="text-success">
                              <strong>Admin:</strong> {review.reply?.message || review.adminResponse}
                            </small>
                          </div>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusColor(review.status)}>
                        {getStatusText(review.status)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{formatDate(review.createdAt || review.updatedAt)}</div>
                        <small className="text-muted">{review.helpful || 0} helpful</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex flex-column gap-1">
                        <CButton 
                          size="sm" 
                          color="info" 
                          variant="outline" 
                          onClick={() => openReviewDetail(review)}
                        >
                          {t('common.view')}
                        </CButton>
                        {review.status === 'pending' && (
                          <>
                            <CButton 
                              size="sm" 
                              color="success" 
                              variant="outline" 
                              onClick={() => handleStatusChange(review._id || review.id, 'approved')}
                              disabled={saving}
                            >
                              {t('reviews.approve')}
                            </CButton>
                            <CButton 
                              size="sm" 
                              color="warning" 
                              variant="outline" 
                              onClick={() => handleStatusChange(review._id || review.id, 'rejected')}
                              disabled={saving}
                            >
                              {t('reviews.reject')}
                            </CButton>
                          </>
                        )}
                        <CButton 
                          size="sm" 
                          color="danger" 
                          variant="outline" 
                          onClick={() => handleDeleteReview(review._id || review.id)}
                          disabled={saving}
                        >
                          {t('common.delete')}
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <small className="text-muted">
                    Trang {pagination.page} / {pagination.pages} (Tổng: {pagination.total} đánh giá)
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1 || loading}
                  >
                    Trước
                  </CButton>
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages || loading}
                  >
                    Sau
                  </CButton>
                </div>
              </div>
            )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Review Detail Modal */}
      <CModal visible={modalOpen} onClose={closeModal} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>Review Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedReview && (
            <CRow className="g-4">
              {/* Product Info */}
              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>{t('products.title')} Information</strong></CCardHeader>
                  <CCardBody>
                    <div className="d-flex align-items-center">
                      <CImage
                        src={selectedReview.productImage}
                        alt={selectedReview.productName}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        className="me-3"
                      />
                      <div>
                        <h5>{selectedReview.productName}</h5>
                        <small className="text-muted">Product ID: {selectedReview.productId}</small>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Customer Info */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>{t('users.customer')} Information</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>Name:</strong> {selectedReview.userName || selectedReview.customerName}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Email:</strong> {selectedReview.userEmail || selectedReview.customerEmail}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>User ID:</strong> {selectedReview.userId || selectedReview.customerId}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Verified:</strong> 
                        <CBadge color={selectedReview.verifiedPurchase ? 'success' : 'secondary'} className="ms-2">
                          {selectedReview.verifiedPurchase ? 'Yes' : 'No'}
                        </CBadge>
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Review Info */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>{t('reviews.review')} Information</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>{t('reviews.rating')}:</strong> 
                        <div className="mt-1" style={{ fontSize: '18px' }}>
                          {renderStars(selectedReview.rating)}
                        </div>
                        <small className="text-muted">{selectedReview.rating}/5 stars</small>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>{t('common.status')}:</strong> 
                        <CBadge color={getStatusColor(selectedReview.status)} className="ms-2">
                          {getStatusText(selectedReview.status)}
                        </CBadge>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Helpful:</strong> {selectedReview.helpful} votes
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>{t('common.date')}:</strong> {formatDate(selectedReview.createdAt)}
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Review Content */}
              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>{t('reviews.review')} Content</strong></CCardHeader>
                  <CCardBody>
                    <div className="mb-3">
                      <h5>{selectedReview.title}</h5>
                      <p>{selectedReview.comment}</p>
                    </div>
                    
                    {selectedReview.images && selectedReview.images.length > 0 && (
                      <div>
                        <strong>Images:</strong>
                        <div className="d-flex gap-2 mt-2">
                          {selectedReview.images.map((image, idx) => (
                            <CImage
                              key={idx}
                              src={image}
                              alt={`Review image ${idx + 1}`}
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Admin Response */}
              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>{t('reviews.adminResponse')}</strong></CCardHeader>
                  <CCardBody>
                    {selectedReview.reply?.message && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong>Current Response:</strong>
                          <small className="text-muted">
                            {selectedReview.reply.repliedAt 
                              ? formatDate(selectedReview.reply.repliedAt)
                              : selectedReview.updatedAt 
                              ? formatDate(selectedReview.updatedAt)
                              : ''}
                          </small>
                        </div>
                        <p className="mb-0">{selectedReview.reply.message}</p>
                      </div>
                    )}
                    <CTextarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder={selectedReview.reply?.message ? t('reviews.updateResponse') + '..."' : t('reviews.addResponse') + '..."'}
                      rows={3}
                    />
                    <div className="mt-2">
                      <CButton 
                        color="primary" 
                        size="sm" 
                        onClick={() => handleAddAdminResponse(selectedReview._id || selectedReview.id)}
                        disabled={saving || !adminResponse.trim()}
                      >
                        {saving ? t('common.saving') : selectedReview.reply?.message ? t('reviews.updateResponse') : t('reviews.addResponse')}
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={closeModal}>
            {t('common.close')}
          </CButton>
          {selectedReview && selectedReview.status === 'pending' && (
            <>
              <CButton 
                color="success" 
                onClick={() => handleStatusChange(selectedReview._id || selectedReview.id, 'approved')}
                disabled={saving}
              >
                {t('reviews.approve')}
              </CButton>
              <CButton 
                color="warning" 
                onClick={() => handleStatusChange(selectedReview._id || selectedReview.id, 'rejected')}
                disabled={saving}
              >
                {t('reviews.reject')}
              </CButton>
            </>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ReviewsManagement
