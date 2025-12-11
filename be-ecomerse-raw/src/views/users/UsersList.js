import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell, 
  CTableBody, CTableDataCell, CSpinner, CButton, CBadge, CModal, CModalHeader, 
  CModalTitle, CModalBody, CModalFooter, CFormInput, CFormSelect, CAlert, 
  CRow, CCol, CListGroup, CListGroupItem, CForm, CFormTextarea, CProgress
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const UsersList = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [classificationFilter, setClassificationFilter] = useState('all')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/users')
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      setError('Không tải được danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggle = async (u) => {
    const action = u.isActive === false ? 'kích hoạt' : 'khóa'
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${u.username}?`)) return
    try {
      const res = await axiosClient.patch(`/user/${u._id}/toggle-active`)
      console.log('Toggle response:', res.data)
      await load()
      // Show success message
      alert(res.data.message || `Tài khoản đã được ${action} thành công`)
    } catch (e) {
      console.error('Toggle error:', e)
      setError('Cập nhật trạng thái thất bại: ' + (e.response?.data?.message || e.message))
    }
  }

  const openDetail = async (user) => {
    setSelectedUser(user)
    setDetailModalOpen(true)
    setLoadingOrders(true)
    try {
      // Load user orders
      const res = await axiosClient.get(`/admin/orders?userId=${user._id}`)
      setUserOrders(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (e) {
      console.error('Error loading user orders:', e)
      setUserOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const closeDetail = () => {
    setDetailModalOpen(false)
    setSelectedUser(null)
    setUserOrders([])
  }

  const getUserClassification = (user) => {
    // Real classification logic based on user data
    const totalOrders = user.totalOrders || 0
    const totalSpent = user.totalSpent || 0
    const memberSince = new Date(user.createdAt)
    const daysSinceJoined = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24))
    
    // VIP: High spending or many orders
    if (totalSpent > 1000 || totalOrders > 20) return 'VIP'
    
    // New: Recently joined (less than 30 days) with no orders
    if (daysSinceJoined < 30 && totalOrders === 0) return 'New'
    
    // Potential: Some activity but not VIP yet
    if (totalSpent > 100 || totalOrders > 3) return 'Potential'
    
    // Regular: Default classification
    return 'Regular'
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'VIP': return 'danger'
      case 'Potential': return 'warning'
      case 'New': return 'info'
      default: return 'secondary'
    }
  }

  const filteredItems = items.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive !== false) ||
      (statusFilter === 'banned' && user.isActive === false)
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'admin' && (user.role === 'admin' || user.isAdmin)) ||
      (roleFilter === 'user' && user.role !== 'admin' && !user.isAdmin)
    
    const classification = getUserClassification(user)
    const matchesClassification = classificationFilter === 'all' || classification === classificationFilter
    
    return matchesSearch && matchesStatus && matchesRole && matchesClassification
  })

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol><strong>{t('users.title')}</strong></CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md={3}>
              <CFormInput 
                placeholder={t('common.search') + '..."'} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('common.filter')}: {t('common.all')}</option>
                <option value="active">{t('users.active')}</option>
                <option value="banned">{t('users.banned')}</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">{t('common.filter')}: {t('common.all')}</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={classificationFilter} onChange={(e) => setClassificationFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="VIP">VIP</option>
                <option value="Potential">Potential</option>
                <option value="New">New</option>
                <option value="Regular">Regular</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>{t('users.customer')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('users.contact')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('users.role')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('users.classification')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.status')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('users.orders')}</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">{t('common.actions')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredItems.map((u, idx) => {
                  const classification = getUserClassification(u)
                  return (
                    <CTableRow key={u._id}>
                      <CTableDataCell>{idx + 1}</CTableDataCell>
                      <CTableDataCell>
                        <div>
                          <div style={{ fontWeight: 500 }}>{u.name || u.username}</div>
                          <small className="text-muted">ID: {u._id}</small>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>
                          <div>{u.email || 'N/A'}</div>
                          <small className="text-muted">{u.phone || 'No phone'}</small>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={u.role === 'admin' || u.isAdmin ? 'danger' : 'primary'}>
                          {u.role ? (u.role.charAt(0).toUpperCase()+u.role.slice(1)) : (u.isAdmin ? 'Admin' : 'User')}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getClassificationColor(classification)}>
                          {classification}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {u.isActive === false ? <CBadge color="danger">{t('users.banned')}</CBadge> : <CBadge color="success">{t('users.active')}</CBadge>}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>{u.totalOrders || 0} {t('users.orders').toLowerCase()}</div>
                          <small className="text-muted" style={{ fontSize: '13px' }}>
                            {(u.totalSpent || 0).toLocaleString('vi-VN')} đ {t('users.totalSpent').toLowerCase()}
                          </small>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CRow className="g-2 justify-content-end">
                          <CCol xs="auto">
                            <CButton size="sm" color="info" variant="outline" onClick={() => openDetail(u)}>
                              {t('common.view')}
                            </CButton>
                          </CCol>
                          <CCol xs="auto">
                            <CButton size="sm" color={u.isActive === false ? 'success' : 'warning'} variant="outline" onClick={() => toggle(u)}>
                              {u.isActive === false ? t('users.unban') : t('users.ban')}
                            </CButton>
                          </CCol>
                        </CRow>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Customer Detail Modal */}
      <CModal visible={detailModalOpen} onClose={closeDetail} size="xl" backdrop="static">
        <CModalHeader>
          <CModalTitle>Customer Details - {selectedUser?.name || selectedUser?.username}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedUser && (
            <CRow className="g-4">
              {/* Customer Info */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>Customer Information</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>Name:</strong> {selectedUser.name || selectedUser.username}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Email:</strong> {selectedUser.email || 'N/A'}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Phone:</strong> {selectedUser.phone || 'N/A'}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Address:</strong> {selectedUser.address || 'N/A'}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Role:</strong> 
                        <CBadge color={selectedUser.role === 'admin' || selectedUser.isAdmin ? 'danger' : 'primary'} className="ms-2">
                          {selectedUser.role ? (selectedUser.role.charAt(0).toUpperCase()+selectedUser.role.slice(1)) : (selectedUser.isAdmin ? 'Admin' : 'User')}
                        </CBadge>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Status:</strong>
                        {selectedUser.isActive === false ? <CBadge color="danger" className="ms-2">Banned</CBadge> : <CBadge color="success" className="ms-2">Active</CBadge>}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Member Since:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Customer Stats */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>Customer Statistics</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>Classification:</strong>
                        <CBadge color={getClassificationColor(getUserClassification(selectedUser))} className="ms-2">
                          {getUserClassification(selectedUser)}
                        </CBadge>
                        <div className="mt-1">
                          <small className="text-muted">
                            {getUserClassification(selectedUser) === 'VIP' && 'High-value customer (1000+ spent or 20+ orders)'}
                            {getUserClassification(selectedUser) === 'Potential' && 'Active customer (100+ spent or 3+ orders)'}
                            {getUserClassification(selectedUser) === 'New' && 'Recently joined customer (less than 30 days)'}
                            {getUserClassification(selectedUser) === 'Regular' && 'Standard customer'}
                          </small>
                        </div>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Tổng đơn hàng:</strong> 
                        <span style={{ fontSize: '16px', fontWeight: 600, marginLeft: 8 }}>
                          {selectedUser.totalOrders || 0} đơn
                        </span>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Tổng đã chi tiêu:</strong> 
                        <span style={{ fontSize: '16px', fontWeight: 600, marginLeft: 8, color: '#111' }}>
                          {(selectedUser.totalSpent || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Giá trị đơn hàng trung bình:</strong> 
                        <span style={{ fontSize: '15px', fontWeight: 600, marginLeft: 8 }}>
                          {selectedUser.totalOrders ? (selectedUser.totalSpent / selectedUser.totalOrders).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : 0} đ
                        </span>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Last Order:</strong> {selectedUser.lastOrderDate ? new Date(selectedUser.lastOrderDate).toLocaleDateString() : 'Never'}
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Purchase History */}
              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>Purchase History</strong></CCardHeader>
                  <CCardBody>
                    {loadingOrders ? (
                      <div className="text-center py-3"><CSpinner color="primary" /></div>
                    ) : userOrders.length > 0 ? (
                      <CTable hover>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Order ID</CTableHeaderCell>
                            <CTableHeaderCell>Date</CTableHeaderCell>
                            <CTableHeaderCell>Amount</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>Items</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {userOrders.slice(0, 10).map((order) => (
                            <CTableRow key={order._id}>
                              <CTableDataCell>{order._id}</CTableDataCell>
                              <CTableDataCell>{new Date(order.createdAt).toLocaleDateString()}</CTableDataCell>
                              <CTableDataCell>${order.totalPrice || order.totalAmount || 0}</CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'danger' : 'warning'}>
                                  {order.orderStatus || order.status}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>{order.items?.length || 0} items</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    ) : (
                      <div className="text-center py-3 text-muted">No orders found</div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={closeDetail}>Close</CButton>
          <CButton color={selectedUser?.isActive === false ? 'success' : 'warning'} onClick={() => selectedUser && toggle(selectedUser)}>
            {selectedUser?.isActive === false ? 'Unban User' : 'Ban User'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UsersList


