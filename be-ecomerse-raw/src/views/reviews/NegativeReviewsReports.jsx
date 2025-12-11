import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CButton, CAlert, CRow, CCol, CFormInput, 
  CFormTextarea, CFormSelect, CSpinner, CForm, CFormLabel, CFormCheck, 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge,
  CInputGroup, CInputGroupText, CProgress, CListGroup, CListGroupItem,
  CImage
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'

const NegativeReviewsReports = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('30')
  
  const [negativeReviews, setNegativeReviews] = useState([])
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({
    totalNegativeReviews: 0,
    criticalIssues: 0,
    highSeverity: 0,
    mediumSeverity: 12,
    lowSeverity: 2,
    resolvedIssues: 15,
    pendingIssues: 8,
    investigatingIssues: 2,
    averageResolutionTime: 3.5, // days
    customerSatisfactionScore: 2.8
  })

  const [categoryStats, setCategoryStats] = useState([
    { category: 'product_defect', count: 8, percentage: 32 },
    { category: 'shipping_issue', count: 6, percentage: 24 },
    { category: 'product_quality', count: 5, percentage: 20 },
    { category: 'customer_service', count: 4, percentage: 16 },
    { category: 'billing_issue', count: 2, percentage: 8 }
  ])

  const loadProducts = async () => {
    try {
      const res = await axiosClient.get('/admin/products-for-filter')
      setProducts(res.data?.data || [])
    } catch (e) {
      console.error('Error loading products:', e)
    }
  }

  const loadReports = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        ...(severityFilter !== 'all' && { severityFilter }),
        ...(productFilter !== 'all' && { productFilter }),
        ...(dateFilter && { dateFilter }),
        ...(searchTerm && { search: searchTerm })
      }
      
      const res = await axiosClient.get('/admin/reviews/negative-reports', { params })
      const reviewsData = res.data?.data || []
      
      setNegativeReviews(reviewsData)
      
      // Calculate stats
      const totalNegativeReviews = reviewsData.length
      const criticalIssues = reviewsData.filter(r => r.severity === 'critical').length
      const highSeverity = reviewsData.filter(r => r.severity === 'high').length
      const mediumSeverity = reviewsData.filter(r => r.severity === 'medium').length
      const lowSeverity = reviewsData.filter(r => r.severity === 'low').length
      const resolvedIssues = reviewsData.filter(r => r.status === 'resolved').length
      const pendingIssues = reviewsData.filter(r => r.status === 'pending').length
      const investigatingIssues = reviewsData.filter(r => r.status === 'investigating').length
      
      // Calculate category stats
      const categoryCounts = {}
      reviewsData.forEach(r => {
        const cat = r.category || 'other'
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      })
      
      const categoryStatsArray = Object.keys(categoryCounts).map(cat => ({
        category: cat,
        count: categoryCounts[cat],
        percentage: Math.round((categoryCounts[cat] / totalNegativeReviews) * 100)
      }))
      
      setCategoryStats(categoryStatsArray)
      
      setStats({
        totalNegativeReviews,
        criticalIssues,
        highSeverity,
        mediumSeverity,
        lowSeverity,
        resolvedIssues,
        pendingIssues,
        investigatingIssues,
        averageResolutionTime: 0, // TODO: Calculate from actual data
        customerSatisfactionScore: 0 // TODO: Calculate from actual data
      })
    } catch (e) {
      console.error('Error loading negative reviews:', e)
      setError('Không tải được báo cáo đánh giá tiêu cực: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadProducts()
    loadReports() 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, productFilter, dateFilter, searchTerm])

  // Reviews are already filtered by API
  const filteredReviews = negativeReviews

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'secondary'
      default: return 'light'
    }
  }

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical': return 'Nghiêm trọng'
      case 'high': return 'Cao'
      case 'medium': return 'Trung bình'
      case 'low': return 'Thấp'
      default: return severity
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success'
      case 'investigating': return 'info'
      case 'pending': return 'warning'
      default: return 'secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved': return 'Đã giải quyết'
      case 'investigating': return 'Đang điều tra'
      case 'pending': return 'Chờ xử lý'
      default: return status
    }
  }

  const getCategoryText = (category) => {
    switch (category) {
      case 'product_defect': return 'Lỗi sản phẩm'
      case 'shipping_issue': return 'Vấn đề giao hàng'
      case 'product_quality': return 'Chất lượng sản phẩm'
      case 'customer_service': return 'Dịch vụ khách hàng'
      case 'billing_issue': return 'Vấn đề thanh toán'
      default: return category
    }
  }

  const getResolutionText = (resolution) => {
    switch (resolution) {
      case 'refund_issued': return 'Hoàn tiền'
      case 'replacement_sent': return 'Gửi sản phẩm thay thế'
      case 'discount_offered': return 'Giảm giá'
      case 'apology_sent': return 'Xin lỗi'
      default: return resolution || 'Chưa giải quyết'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
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
          <h2>Negative Reviews Reports</h2>
          <p className="text-muted">Báo cáo đánh giá tiêu cực và xử lý khiếu nại</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="danger" variant="outline">
            Export Report
          </CButton>
        </CCol>
      </CRow>

      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}

      {/* Key Metrics */}
      <CRow className="mb-4">
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-danger">{stats.totalNegativeReviews}</h4>
              <p className="text-muted mb-0">Total Negative</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-danger">{stats.criticalIssues}</h4>
              <p className="text-muted mb-0">Critical Issues</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-warning">{stats.pendingIssues}</h4>
              <p className="text-muted mb-0">Pending</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-info">{stats.investigatingIssues}</h4>
              <p className="text-muted mb-0">Investigating</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-success">{stats.resolvedIssues}</h4>
              <p className="text-muted mb-0">Resolved</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-primary">{stats.averageResolutionTime}d</h4>
              <p className="text-muted mb-0">Avg Resolution</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Charts */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <strong>Issues by Category</strong>
            </CCardHeader>
            <CCardBody>
              {/* Chart component temporarily disabled - requires @coreui/react-chartjs package */}
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p><strong>Issues by Category:</strong></p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {categoryStats.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '10px' }}>
                      {getCategoryText(c.category)}: {c.count}
                    </li>
                  ))}
                </ul>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <strong>Issues by Severity</strong>
            </CCardHeader>
            <CCardBody>
              {/* Chart component temporarily disabled - requires @coreui/react-chartjs package */}
              <div style={{ padding: '20px' }}>
                <p><strong>Issues by Severity:</strong></p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '10px' }}>Critical: {stats.criticalIssues || 0}</li>
                  <li style={{ marginBottom: '10px' }}>High: {stats.highSeverity || 0}</li>
                  <li style={{ marginBottom: '10px' }}>Medium: {stats.mediumSeverity || 0}</li>
                  <li style={{ marginBottom: '10px' }}>Low: {stats.lowSeverity || 0}</li>
                </ul>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormInput
                placeholder="Tìm kiếm đánh giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option value="all">Tất cả mức độ</option>
                <option value="critical">Nghiêm trọng</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                <option value="all">Tất cả sản phẩm</option>
                {products.map(product => (
                  <option key={product._id || product.id} value={product._id || product.id}>{product.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="7">7 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="90">90 ngày qua</option>
                <option value="365">1 năm qua</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CButton color="secondary" variant="outline" onClick={() => {
                setSearchTerm('')
                setSeverityFilter('all')
                setProductFilter('all')
                setDateFilter('30')
              }}>
                Reset
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Negative Reviews Table */}
      <CCard>
        <CCardHeader>
          <strong>Negative Reviews ({filteredReviews.length})</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Product</CTableHeaderCell>
                  <CTableHeaderCell>Customer</CTableHeaderCell>
                  <CTableHeaderCell>Issue</CTableHeaderCell>
                  <CTableHeaderCell>Severity</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Resolution</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
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
                          <div style={{ fontWeight: 500 }}>{review.productName}</div>
                          <small className="text-muted">Order: {review.orderId}</small>
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
                        <div style={{ fontWeight: 500 }}>{review.title}</div>
                        <div style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {review.comment}
                        </div>
                        <div style={{ fontSize: '14px' }}>{renderStars(review.rating)}</div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getSeverityColor(review.severity)}>
                        {getSeverityText(review.severity)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>{getCategoryText(review.category)}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusColor(review.status)}>
                        {getStatusText(review.status)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <small>{getResolutionText(review.resolution)}</small>
                        {review.adminResponse && (
                          <div className="mt-1">
                            <small className="text-info">
                              <strong>Admin:</strong> {review.adminResponse}
                            </small>
                          </div>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{formatDate(review.createdAt)}</div>
                        <small className="text-muted">Purchased: {formatDate(review.purchaseDate)}</small>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default NegativeReviewsReports
