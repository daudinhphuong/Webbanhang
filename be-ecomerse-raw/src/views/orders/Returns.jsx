import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, 
  CTableBody, CTableDataCell, CButton, CBadge, CRow, CCol, CFormSelect, CModal, 
  CModalHeader, CModalTitle, CModalBody, CModalFooter, CSpinner, CFormInput, 
  CFormTextarea, CAlert, CListGroup, CListGroupItem, CForm, CInputGroup, CInputGroupText
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const returnStatusColors = { 
  requested: 'warning', 
  approved: 'info', 
  processing: 'primary', 
  completed: 'success', 
  rejected: 'danger' 
}

const Returns = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [returnTypeFilter, setReturnTypeFilter] = useState('all')
  const [newReturnModal, setNewReturnModal] = useState(false)
  const [refundModal, setRefundModal] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [stats, setStats] = useState(null)
  const [returnForm, setReturnForm] = useState({
    orderId: '',
    reason: '',
    description: '',
    refundAmount: '',
    returnType: 'refund'
  })
  const [refundForm, setRefundForm] = useState({
    refundId: '',
    method: 'original',
    transactionId: '',
    notes: ''
  })

  const loadReturns = async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        returnType: returnTypeFilter !== 'all' ? returnTypeFilter : undefined,
        search: searchTerm || undefined
      }
      
      const res = await axiosClient.get('/admin/returns', { params: queryParams })
      setItems(res.data?.data || [])
      setPagination(res.data?.pagination || pagination)
      setStats(res.data?.stats || null)
    } catch (e) {
      console.error('Error loading returns:', e)
      setError('Không tải được danh sách đơn trả hàng: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReturns()
  }, [])

  useEffect(() => {
    // Reload when filters change
    const timer = setTimeout(() => {
      loadReturns({ page: 1 })
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, returnTypeFilter])

  const openDetail = (returnItem) => {
    setSelectedReturn(returnItem)
    setDetailModalOpen(true)
  }

  const closeDetail = () => {
    setDetailModalOpen(false)
    setSelectedReturn(null)
  }

  const openNewReturn = () => {
    setReturnForm({
      orderId: '',
      reason: '',
      description: '',
      refundAmount: '',
      returnType: 'refund'
    })
    setNewReturnModal(true)
  }

  const closeNewReturn = () => {
    setNewReturnModal(false)
    setReturnForm({
      orderId: '',
      reason: '',
      description: '',
      refundAmount: '',
      returnType: 'refund'
    })
  }

  const handleCreateReturn = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const returnData = {
        orderId: returnForm.orderId,
        returnType: returnForm.returnType,
        reason: returnForm.reason,
        description: returnForm.description || ''
      }
      
      await axiosClient.post('/admin/returns', returnData)
      setSuccess('Tạo đơn trả hàng thành công!')
      closeNewReturn()
      await loadReturns()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error('Error creating return:', e)
      setError('Lỗi khi tạo đơn trả hàng: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const updateReturnStatus = async (returnId, newStatus, adminNotes = '') => {
    try {
      setLoading(true)
      await axiosClient.patch(`/admin/returns/${returnId}/status`, { 
        status: newStatus,
        adminNotes 
      })
      setSuccess('Cập nhật trạng thái thành công!')
      await loadReturns()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error('Error updating return status:', e)
      setError('Lỗi khi cập nhật trạng thái: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleProcessRefund = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await axiosClient.post(`/admin/returns/${selectedReturn._id}/refund`, refundForm)
      setSuccess('Bắt đầu xử lý hoàn tiền!')
      setRefundModal(false)
      await loadReturns()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error('Error processing refund:', e)
      setError('Lỗi khi xử lý hoàn tiền: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRefund = async (returnId) => {
    try {
      setLoading(true)
      await axiosClient.post(`/admin/returns/${returnId}/complete-refund`, {
        transactionId: refundForm.transactionId
      })
      setSuccess('Hoàn tiền đã hoàn tất!')
      await loadReturns()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error('Error completing refund:', e)
      setError('Lỗi khi hoàn tất hoàn tiền: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const openRefundModal = (returnItem) => {
    setSelectedReturn(returnItem)
    setRefundForm({
      refundId: '',
      method: 'original',
      transactionId: '',
      notes: ''
    })
    setRefundModal(true)
  }

  const closeRefundModal = () => {
    setRefundModal(false)
    setSelectedReturn(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <>
      <CCard>
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol><strong>{t('returns.title')}</strong></CCol>
            <CCol className="text-end">
              <CButton color="primary" onClick={openNewReturn}>New Return</CButton>
            </CCol>
          </CRow>
          {stats && (
            <CRow className="mt-3">
              <CCol md={2}>
                <div className="text-center">
                  <div className="h5 mb-0">{stats.totalReturns}</div>
                  <small className="text-muted">Total</small>
                </div>
              </CCol>
              <CCol md={2}>
                <div className="text-center">
                  <div className="h5 mb-0 text-warning">{stats.requestedReturns}</div>
                  <small className="text-muted">Requested</small>
                </div>
              </CCol>
              <CCol md={2}>
                <div className="text-center">
                  <div className="h5 mb-0 text-info">{stats.approvedReturns}</div>
                  <small className="text-muted">Approved</small>
                </div>
              </CCol>
              <CCol md={2}>
                <div className="text-center">
                  <div className="h5 mb-0 text-primary">{stats.processingReturns}</div>
                  <small className="text-muted">Processing</small>
                </div>
              </CCol>
              <CCol md={2}>
                <div className="text-center">
                  <div className="h5 mb-0 text-success">{stats.completedReturns}</div>
                  <small className="text-muted">Completed</small>
                </div>
              </CCol>
              <CCol md={2}>
                <div className="text-center">
                  <div className="h5 mb-0 text-danger">{formatCurrency(stats.totalRefundAmount)}</div>
                  <small className="text-muted">Total Refunded</small>
                </div>
              </CCol>
            </CRow>
          )}
          <CRow className="mt-3">
            <CCol md={4}>
              <CFormInput 
                placeholder={t('common.search') + '..."'} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('common.status')}</option>
                <option value="requested">Requested</option>
                <option value="approved">{t('returns.approve')}</option>
                <option value="processing">{t('returns.process')}</option>
                <option value="completed">Completed</option>
                <option value="rejected">{t('returns.reject')}</option>
                <option value="cancelled">Cancelled</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect value={returnTypeFilter} onChange={(e) => setReturnTypeFilter(e.target.value)}>
                <option value="all">{t('common.all')} Types</option>
                <option value="refund">Refund</option>
                <option value="exchange">Exchange</option>
                <option value="repair">Repair</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
          {success && <CAlert color="success" className="mb-3">{success}</CAlert>}
          
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-5 text-muted">Không có đơn trả hàng nào</div>
          ) : (
            <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Return Number</CTableHeaderCell>
                  <CTableHeaderCell>{t('returns.orderId')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('returns.customer')}</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>{t('returns.reason')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.amount')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('returns.status')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('returns.requestDate')}</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">{t('common.actions')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {items.map((item) => (
                  <CTableRow key={item._id}>
                    <CTableDataCell>
                      <div style={{ fontWeight: 500 }}>{item.returnNumber || item._id}</div>
                    </CTableDataCell>
                    <CTableDataCell>{item.orderId}</CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {item.user?.name || 
                           item.user?.username || 
                           (item.customerName && item.customerName !== item.userId ? item.customerName : null) ||
                           item.userId || 
                           'N/A'}
                        </div>
                        <small className="text-muted">
                          {item.user?.email || item.customerEmail || ''}
                        </small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={item.returnType === 'refund' ? 'info' : item.returnType === 'exchange' ? 'warning' : 'secondary'}>
                        {item.returnType}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{item.reason}</div>
                      {item.items && item.items.length > 0 && (
                        <small className="text-muted">{item.items.length} item(s)</small>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{formatCurrency(item.refundAmount || 0)}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={returnStatusColors[item.status] || 'secondary'}>
                        {item.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CRow className="g-2 justify-content-end">
                        <CCol xs="auto">
                          <CButton size="sm" color="info" variant="outline" onClick={() => openDetail(item)}>
                            {t('common.view')}
                          </CButton>
                        </CCol>
                        {item.status === 'approved' && !item.refund && (
                          <CCol xs="auto">
                            <CButton size="sm" color="success" variant="outline" onClick={() => openRefundModal(item)}>
                              {t('returns.process')} Refund
                            </CButton>
                          </CCol>
                        )}
                        {item.refund?.status === 'processing' && (
                          <CCol xs="auto">
                            <CButton size="sm" color="primary" variant="outline" onClick={() => handleCompleteRefund(item._id)}>
                              Complete Refund
                            </CButton>
                          </CCol>
                        )}
                        <CCol xs="auto">
                          <CFormSelect 
                            size="sm" 
                            value={item.status} 
                            onChange={(e) => updateReturnStatus(item._id, e.target.value)}
                          >
                            <option value="requested">Requested</option>
                            <option value="approved">{t('returns.approve')}</option>
                            <option value="processing">{t('returns.process')}</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">{t('returns.reject')}</option>
                            <option value="cancelled">Cancelled</option>
                          </CFormSelect>
                        </CCol>
                      </CRow>
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
                    Trang {pagination.page} / {pagination.pages} (Tổng: {pagination.total} đơn)
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadReturns({ page: Math.max(1, pagination.page - 1) })}
                    disabled={pagination.page === 1 || loading}
                  >
                    Trước
                  </CButton>
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadReturns({ page: Math.min(pagination.pages, pagination.page + 1) })}
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

      {/* Return Detail Modal */}
      <CModal visible={detailModalOpen} onClose={closeDetail} size="xl" backdrop="static">
        <CModalHeader>
          <CModalTitle>Return Details - {selectedReturn?.returnNumber || selectedReturn?._id}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedReturn && (
            <CRow className="g-4">
              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>Customer Information</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>Name:</strong> {
                          selectedReturn.user?.name ||
                          selectedReturn.user?.username ||
                          (selectedReturn.customerName && selectedReturn.customerName !== selectedReturn.userId 
                            ? selectedReturn.customerName 
                            : null) ||
                          selectedReturn.userId ||
                          'N/A'
                        }
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Email:</strong> {selectedReturn.user?.email || selectedReturn.customerEmail || 'N/A'}
                      </CListGroupItem>
                      {selectedReturn.customerPhone && (
                        <CListGroupItem>
                          <strong>Phone:</strong> {selectedReturn.customerPhone}
                        </CListGroupItem>
                      )}
                      <CListGroupItem>
                        <strong>Order ID:</strong> {selectedReturn.orderId}
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>Return Information</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>Return Number:</strong> {selectedReturn.returnNumber || selectedReturn._id}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Type:</strong> 
                        <CBadge color={selectedReturn.returnType === 'refund' ? 'info' : selectedReturn.returnType === 'exchange' ? 'warning' : 'secondary'} className="ms-2">
                          {selectedReturn.returnType}
                        </CBadge>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Reason:</strong> {selectedReturn.reason}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Amount:</strong> {formatCurrency(selectedReturn.refundAmount || 0)}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Status:</strong>
                        <CBadge color={returnStatusColors[selectedReturn.status]} className="ms-2">
                          {selectedReturn.status}
                        </CBadge>
                      </CListGroupItem>
                      {selectedReturn.trackingNumber && (
                        <CListGroupItem>
                          <strong>Tracking:</strong> {selectedReturn.trackingNumber}
                        </CListGroupItem>
                      )}
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>

              {selectedReturn.items && selectedReturn.items.length > 0 && (
                <CCol md={12}>
                  <CCard>
                    <CCardHeader><strong>Return Items</strong></CCardHeader>
                    <CCardBody>
                      <CTable hover>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Product</CTableHeaderCell>
                            <CTableHeaderCell>Quantity</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                            <CTableHeaderCell>Reason</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {selectedReturn.items.map((item, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>{item.productName || item.productId}</CTableDataCell>
                              <CTableDataCell>{item.quantity}</CTableDataCell>
                              <CTableDataCell>{formatCurrency(item.price)}</CTableDataCell>
                              <CTableDataCell>{item.reason || '-'}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </CCardBody>
                  </CCard>
                </CCol>
              )}

              {selectedReturn.refund && (
                <CCol md={12}>
                  <CCard>
                    <CCardHeader><strong>Refund Information</strong></CCardHeader>
                    <CCardBody>
                      <CListGroup flush>
                        <CListGroupItem>
                          <strong>Refund ID:</strong> {selectedReturn.refund.refundId}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Amount:</strong> {formatCurrency(selectedReturn.refund.amount)}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Method:</strong> {selectedReturn.refund.method}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Status:</strong>
                          <CBadge color={selectedReturn.refund.status === 'completed' ? 'success' : selectedReturn.refund.status === 'processing' ? 'primary' : 'warning'} className="ms-2">
                            {selectedReturn.refund.status}
                          </CBadge>
                        </CListGroupItem>
                        {selectedReturn.refund.transactionId && (
                          <CListGroupItem>
                            <strong>Transaction ID:</strong> {selectedReturn.refund.transactionId}
                          </CListGroupItem>
                        )}
                        {selectedReturn.refund.notes && (
                          <CListGroupItem>
                            <strong>Notes:</strong> {selectedReturn.refund.notes}
                          </CListGroupItem>
                        )}
                        {selectedReturn.refund.processedAt && (
                          <CListGroupItem>
                            <strong>Processed At:</strong> {new Date(selectedReturn.refund.processedAt).toLocaleString('vi-VN')}
                          </CListGroupItem>
                        )}
                      </CListGroup>
                    </CCardBody>
                  </CCard>
                </CCol>
              )}

              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>Description</strong></CCardHeader>
                  <CCardBody>
                    <p>{selectedReturn.description || 'No description provided'}</p>
                  </CCardBody>
                </CCard>
              </CCol>

              {selectedReturn.adminNotes && (
                <CCol md={12}>
                  <CCard>
                    <CCardHeader><strong>Admin Notes</strong></CCardHeader>
                    <CCardBody>
                      <p>{selectedReturn.adminNotes}</p>
                    </CCardBody>
                  </CCard>
                </CCol>
              )}

              {selectedReturn.returnAddress && (
                <CCol md={12}>
                  <CCard>
                    <CCardHeader><strong>Return Address</strong></CCardHeader>
                    <CCardBody>
                      <p>
                        {selectedReturn.returnAddress.street}<br/>
                        {selectedReturn.returnAddress.city}, {selectedReturn.returnAddress.state} {selectedReturn.returnAddress.zipCode}<br/>
                        {selectedReturn.returnAddress.country}
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={closeDetail}>Close</CButton>
        </CModalFooter>
      </CModal>

      {/* New Return Modal */}
      <CModal visible={newReturnModal} onClose={closeNewReturn} backdrop="static">
        <CModalHeader>
          <CModalTitle>Create New Return</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleCreateReturn}>
          <CModalBody>
            <CAlert color="info" className="mb-3">
              Tạo đơn trả hàng mới cho khách hàng. Vui lòng nhập đầy đủ thông tin.
            </CAlert>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormInput 
                  label="Order ID *" 
                  value={returnForm.orderId} 
                  onChange={(e) => setReturnForm({...returnForm, orderId: e.target.value})}
                  placeholder="Nhập Order ID"
                  required 
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect 
                  label="Return Type *" 
                  value={returnForm.returnType} 
                  onChange={(e) => setReturnForm({...returnForm, returnType: e.target.value})}
                >
                  <option value="refund">Refund</option>
                  <option value="exchange">Exchange</option>
                  <option value="repair">Repair</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormInput 
                  label="Reason *" 
                  value={returnForm.reason} 
                  onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                  placeholder="Lý do trả hàng"
                  required 
                />
              </CCol>
              <CCol md={12}>
                <CFormTextarea 
                  label="Description" 
                  value={returnForm.description} 
                  onChange={(e) => setReturnForm({...returnForm, description: e.target.value})}
                  rows={3}
                  placeholder="Mô tả chi tiết..."
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={closeNewReturn} disabled={loading}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Return'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Process Refund Modal */}
      <CModal visible={refundModal} onClose={closeRefundModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>Process Refund - {selectedReturn?.returnNumber}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleProcessRefund}>
          <CModalBody>
            {selectedReturn && (
              <>
                <CAlert color="info" className="mb-3">
                  <strong>Refund Amount:</strong> {formatCurrency(selectedReturn.refundAmount || 0)}
                </CAlert>
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormInput 
                      label="Refund ID" 
                      value={refundForm.refundId} 
                      onChange={(e) => setRefundForm({...refundForm, refundId: e.target.value})}
                      placeholder="Auto-generated if empty"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormSelect 
                      label="Refund Method *" 
                      value={refundForm.method} 
                      onChange={(e) => setRefundForm({...refundForm, method: e.target.value})}
                      required
                    >
                      <option value="original">Original Payment Method</option>
                      <option value="store_credit">Store Credit</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={12}>
                    <CFormInput 
                      label="Transaction ID" 
                      value={refundForm.transactionId} 
                      onChange={(e) => setRefundForm({...refundForm, transactionId: e.target.value})}
                      placeholder="Transaction ID (if available)"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormTextarea 
                      label="Notes" 
                      value={refundForm.notes} 
                      onChange={(e) => setRefundForm({...refundForm, notes: e.target.value})}
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </CCol>
                </CRow>
              </>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={closeRefundModal} disabled={loading}>Cancel</CButton>
            <CButton color="success" type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Process Refund'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default Returns
