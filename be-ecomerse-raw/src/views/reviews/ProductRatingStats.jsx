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

const ProductRatingStats = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [overallStats, setOverallStats] = useState({
    totalProducts: 0,
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recentReviews: 0,
    verifiedReviews: 0,
    topRatedProducts: 0,
    lowRatedProducts: 0
  })

  const loadStats = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        ...(categoryFilter !== 'all' && { categoryFilter }),
        ...(ratingFilter !== 'all' && { ratingFilter }),
        ...(searchTerm && { search: searchTerm })
      }
      
      const res = await axiosClient.get('/admin/reviews/rating-stats', { params })
      const statsData = res.data?.data || []
      
      setProducts(statsData)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(statsData.map(p => p.category).filter(Boolean))]
      setCategories(uniqueCategories)
      
      // Calculate overall stats
      const totalProducts = statsData.length
      const totalReviews = statsData.reduce((sum, p) => sum + (p.totalReviews || 0), 0)
      const avgRating = statsData.length > 0
        ? statsData.reduce((sum, p) => sum + (p.averageRating || 0), 0) / statsData.length
        : 0
      
      const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      statsData.forEach(p => {
        if (p.ratingDistribution) {
          Object.keys(p.ratingDistribution).forEach(rating => {
            ratingDist[rating] = (ratingDist[rating] || 0) + (p.ratingDistribution[rating] || 0)
          })
        }
      })
      
      const recentReviews = statsData.reduce((sum, p) => sum + (p.recentReviews || 0), 0)
      const verifiedReviews = statsData.reduce((sum, p) => sum + (p.verifiedReviews || 0), 0)
      const topRatedProducts = statsData.filter(p => p.averageRating >= 4.5).length
      const lowRatedProducts = statsData.filter(p => p.averageRating < 3).length
      
      setOverallStats({
        totalProducts,
        totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: ratingDist,
        recentReviews,
        verifiedReviews,
        topRatedProducts,
        lowRatedProducts
      })
    } catch (e) {
      console.error('Error loading rating stats:', e)
      setError('Không tải được thống kê đánh giá: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadStats() 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, ratingFilter, searchTerm])

  // Products are already filtered by API
  const filteredProducts = products

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'success'
    if (rating >= 3.5) return 'warning'
    return 'danger'
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? '#ffc107' : '#e9ecef' }}>
        ★
      </span>
    ))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getRatingPercentage = (product, rating) => {
    const total = product.totalReviews
    return total > 0 ? Math.round((product.ratingDistribution[rating] / total) * 100) : 0
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol md={8}>
          <h2>Product Rating Statistics</h2>
          <p className="text-muted">Thống kê điểm đánh giá sản phẩm</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="info" variant="outline">
            Export Statistics
          </CButton>
        </CCol>
      </CRow>

      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}

      {/* Overall Statistics */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-primary">{overallStats.totalProducts}</h4>
              <p className="text-muted mb-0">Total Products</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-info">{overallStats.totalReviews}</h4>
              <p className="text-muted mb-0">Total Reviews</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-success">{overallStats.averageRating.toFixed(1)}</h4>
              <p className="text-muted mb-0">Average Rating</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-warning">{overallStats.verifiedReviews}</h4>
              <p className="text-muted mb-0">Verified Reviews</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Charts */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <strong>Overall Rating Distribution</strong>
            </CCardHeader>
            <CCardBody>
              {/* Chart component temporarily disabled - requires @coreui/react-chartjs package */}
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Rating Distribution:</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>5 Stars: {overallStats.ratingDistribution[5] || 0}</li>
                  <li>4 Stars: {overallStats.ratingDistribution[4] || 0}</li>
                  <li>3 Stars: {overallStats.ratingDistribution[3] || 0}</li>
                  <li>2 Stars: {overallStats.ratingDistribution[2] || 0}</li>
                  <li>1 Star: {overallStats.ratingDistribution[1] || 0}</li>
                </ul>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <strong>Top Rated Products</strong>
            </CCardHeader>
            <CCardBody>
              {/* Chart component temporarily disabled - requires @coreui/react-chartjs package */}
              <div style={{ padding: '20px' }}>
                <p><strong>Top Rated Products:</strong></p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {products.slice(0, 5).map((p, idx) => (
                    <li key={idx} style={{ marginBottom: '10px' }}>
                      {p.name}: {p.averageRating?.toFixed(1) || '0.0'} ⭐
                    </li>
                  ))}
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
            <CCol md={4}>
              <CFormInput
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="all">Tất cả điểm</option>
                <option value="high">Cao (4.5+)</option>
                <option value="medium">Trung bình (3.5-4.4)</option>
                <option value="low">Thấp (&lt;3.5)</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CButton color="secondary" variant="outline" onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setRatingFilter('all')
              }}>
                Reset
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Products Table */}
      <CCard>
        <CCardHeader>
          <strong>Product Rating Details ({filteredProducts.length})</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Product</CTableHeaderCell>
                  <CTableHeaderCell>Rating</CTableHeaderCell>
                  <CTableHeaderCell>Reviews</CTableHeaderCell>
                  <CTableHeaderCell>Distribution</CTableHeaderCell>
                  <CTableHeaderCell>Sales</CTableHeaderCell>
                  <CTableHeaderCell>Last Review</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredProducts.map((product) => (
                  <CTableRow key={product.productId || product.id}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <CImage
                          src={product.productImage || product.image || ''}
                          alt={product.productName || product.name || ''}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          className="me-3"
                        />
                        <div>
                          <div style={{ fontWeight: 500 }}>{product.productName || product.name || 'Unknown'}</div>
                          <small className="text-muted">{product.category || 'Uncategorized'}</small>
                          <div className="text-success">{formatCurrency(product.price || 0)}</div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontSize: '16px' }}>{renderStars(product.averageRating)}</div>
                        <div>
                          <CBadge color={getRatingColor(product.averageRating)}>
                            {product.averageRating.toFixed(1)}/5
                          </CBadge>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{product.totalReviews}</div>
                        <small className="text-muted">
                          {product.verifiedReviews} verified
                        </small>
                        <div>
                          <small className="text-info">
                            {product.recentReviews} recent
                          </small>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div style={{ minWidth: '120px' }}>
                        {[5, 4, 3, 2, 1].map(rating => (
                          <div key={rating} className="d-flex align-items-center mb-1">
                            <small className="me-2" style={{ width: '20px' }}>{rating}★</small>
                            <CProgress 
                              value={getRatingPercentage(product, rating)} 
                              className="me-2" 
                              style={{ height: '8px', flex: 1 }}
                            />
                            <small style={{ width: '30px' }}>
                              {product.ratingDistribution[rating]}
                            </small>
                          </div>
                        ))}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{product.sales || 'N/A'}</div>
                        <small className="text-success">{product.revenue ? formatCurrency(product.revenue) : 'N/A'}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{formatDate(product.lastReviewDate)}</div>
                        <small className="text-muted">Last review</small>
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

export default ProductRatingStats
