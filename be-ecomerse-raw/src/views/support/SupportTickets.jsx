import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CButton, CAlert, CRow, CCol, CFormInput, 
  CFormTextarea, CFormSelect, CSpinner, CForm, CFormLabel, CFormCheck, 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge,
  CInputGroup, CInputGroupText, CProgress, CListGroup, CListGroupItem,
  CAvatar, CFormTextarea as CTextarea
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const SupportTickets = () => {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  
  const supportAgents = [
    { id: 'admin1', name: 'Admin Support' },
    { id: 'admin2', name: 'Support Team' },
    { id: 'manager1', name: 'Manager' },
    { id: 'tech1', name: 'Technical Support' }
  ]

  const [tickets, setTickets] = useState([])

  const [newTicket, setNewTicket] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    subject: '',
    description: '',
    category: 'general_inquiry',
    priority: 'medium',
    orderId: '',
    tags: []
  })

  const [replyText, setReplyText] = useState('')
  const [resolutionText, setResolutionText] = useState('')

  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    escalatedTickets: 0,
    averageResolutionTimeDays: 0,
    customerSatisfaction: 0
  })

  const [categories, setCategories] = useState([])
  const [assignees, setAssignees] = useState(supportAgents)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [initialized, setInitialized] = useState(false)

  const loadTickets = async (overrides = {}) => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: overrides.page ?? (overrides.reset ? 1 : pagination.page) ?? 1,
        limit: overrides.limit ?? pagination.limit ?? 20,
        search: overrides.search ?? searchTerm ?? '',
        status: overrides.status ?? statusFilter ?? 'all',
        priority: overrides.priority ?? priorityFilter ?? 'all',
        category: overrides.category ?? categoryFilter ?? 'all',
        assignedTo: overrides.assignedTo ?? assigneeFilter ?? 'all'
      }

      const res = await axiosClient.get('/support/tickets', { params })
      const response = res?.data || {}
      const responseStats = response.stats || {}

      setTickets(response.data || [])
      setStats({
        totalTickets: responseStats.totalTickets || 0,
        openTickets: responseStats.openTickets || 0,
        inProgressTickets: responseStats.inProgressTickets || 0,
        resolvedTickets: responseStats.resolvedTickets || 0,
        closedTickets: responseStats.closedTickets || 0,
        escalatedTickets: responseStats.escalatedTickets || 0,
        averageResolutionTimeDays: responseStats.averageResolutionTimeDays || 0,
        customerSatisfaction: responseStats.customerSatisfaction || 0
      })
      setCategories(
        (responseStats.categories || []).map((category) => ({
          ...category,
          name: getCategoryText(category.id || category.name || category._id),
          id: category.id || category._id || category.name,
        }))
      )
      const apiAssignees = (responseStats.assignees || []).map((agent) => ({
        id: agent.id || agent._id || agent.name,
        name: agent.name || agent.id || agent._id || 'Unknown',
      }))
      const mergedAssignees = [...supportAgents]
      apiAssignees.forEach((agent) => {
        if (agent.id && !mergedAssignees.some((existing) => existing.id === agent.id)) {
          mergedAssignees.push(agent)
        }
      })
      setAssignees(mergedAssignees)
      setPagination({
        page: response.pagination?.page || params.page,
        limit: response.pagination?.limit || params.limit,
        total: response.pagination?.total || (response.data?.length || 0),
        pages: response.pagination?.pages || 1
      })
      setInitialized(true)
    } catch (e) {
      const message = e?.response?.data?.message || 'Không tải được danh sách ticket'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTickets({ reset: true }) }, [])

  useEffect(() => {
    if (!initialized) return
    const handler = setTimeout(() => {
      loadTickets({ search: searchTerm, page: 1 })
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    loadTickets({ status: value, page: 1 })
  }

  const handlePriorityFilterChange = (value) => {
    setPriorityFilter(value)
    loadTickets({ priority: value, page: 1 })
  }

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value)
    loadTickets({ category: value, page: 1 })
  }

  const handleAssigneeFilterChange = (value) => {
    setAssigneeFilter(value)
    loadTickets({ assignedTo: value, page: 1 })
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setSaving(true)
      await axiosClient.patch(`/support/tickets/${ticketId}`, {
        status: newStatus,
        historyDescription: `Status changed to ${newStatus}`,
      })
      setSuccess(`Ticket đã được cập nhật thành ${getStatusText(newStatus)}!`)
      setTimeout(() => setSuccess(''), 3000)
      await loadTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        const detailRes = await axiosClient.get(`/support/tickets/${ticketId}`)
        setSelectedTicket(detailRes.data)
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi cập nhật trạng thái ticket'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignTo = async (ticketId, assignee) => {
    try {
      setSaving(true)
      if (!assignee) {
        await axiosClient.patch(`/support/tickets/${ticketId}`, {
          assignedTo: null,
          historyDescription: 'Ticket unassigned',
        })
        setSuccess('Ticket đã được bỏ phân công!')
        setTimeout(() => setSuccess(''), 3000)
        await loadTickets()
        if (selectedTicket && selectedTicket._id === ticketId) {
          const detailRes = await axiosClient.get(`/support/tickets/${ticketId}`)
          setSelectedTicket(detailRes.data)
        }
        return
      }
      const assignedAgent =
        assignees.find((agent) => agent.id === assignee) ||
        supportAgents.find((agent) => agent.id === assignee) || { id: assignee, name: assignee }

      await axiosClient.patch(`/support/tickets/${ticketId}`, {
        assignedTo: { id: assignedAgent.id, name: assignedAgent.name },
        historyDescription: `Assigned to ${assignedAgent.name}`,
      })

      setSuccess('Ticket đã được phân công!')
      setTimeout(() => setSuccess(''), 3000)
      await loadTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        const detailRes = await axiosClient.get(`/support/tickets/${ticketId}`)
        setSelectedTicket(detailRes.data)
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi phân công ticket'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) {
      setError('Vui lòng nhập phản hồi')
      return
    }

    try {
      setSaving(true)
      await axiosClient.post(`/support/tickets/${ticketId}/replies`, {
        message: replyText.trim(),
        isAdmin: true
      })

      setReplyText('')
      setSuccess('Phản hồi đã được gửi!')
      setTimeout(() => setSuccess(''), 3000)
      await loadTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        const detailRes = await axiosClient.get(`/support/tickets/${ticketId}`)
        setSelectedTicket(detailRes.data)
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi gửi phản hồi'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async (ticketId) => {
    if (!resolutionText.trim()) {
      setError('Vui lòng nhập giải pháp')
      return
    }

    try {
      setSaving(true)
      await axiosClient.patch(`/support/tickets/${ticketId}`, {
        status: 'resolved',
        resolution: resolutionText.trim(),
        historyDescription: 'Ticket resolved'
      })

      setResolutionText('')
      setSuccess('Ticket đã được giải quyết!')
      setTimeout(() => setSuccess(''), 3000)
      await loadTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        const detailRes = await axiosClient.get(`/support/tickets/${ticketId}`)
        setSelectedTicket(detailRes.data)
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi giải quyết ticket'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.customerName || !newTicket.subject || !newTicket.description) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setSaving(true)
      await axiosClient.post('/support/tickets', newTicket)
      await loadTickets({ reset: true })
      setNewTicket({
        customerId: '',
        customerName: '',
        customerEmail: '',
        subject: '',
        description: '',
        category: 'general_inquiry',
        priority: 'medium',
        orderId: '',
        tags: []
      })
      setCreateModalOpen(false)
      setSuccess('Ticket đã được tạo!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi tạo ticket'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const openTicketDetail = async (ticket) => {
    setReplyText('')
    setResolutionText(ticket.resolution || '')
    setSelectedTicket(ticket)
    setModalOpen(true)
    try {
      const res = await axiosClient.get(`/support/tickets/${ticket._id || ticket.id}`)
      setSelectedTicket(res.data)
      setResolutionText(res.data?.resolution || '')
    } catch (e) {
      const message = e?.response?.data?.message || 'Không thể tải chi tiết ticket'
      setError(message)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedTicket(null)
    setReplyText('')
    setResolutionText('')
  }

  const filteredTickets = tickets

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'danger'
      case 'in_progress': return 'warning'
      case 'resolved': return 'info'
      case 'closed': return 'success'
      case 'escalated': return 'secondary'
      default: return 'light'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Mở'
      case 'in_progress': return 'Đang xử lý'
      case 'resolved': return 'Đã giải quyết'
      case 'closed': return 'Đã đóng'
      case 'escalated': return 'Chuyển cấp'
      default: return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Cao'
      case 'medium': return 'Trung bình'
      case 'low': return 'Thấp'
      default: return priority
    }
  }

  const getCategoryText = (category) => {
    switch (category) {
      case 'product_issue': return 'Lỗi sản phẩm'
      case 'refund': return 'Hoàn tiền'
      case 'shipping': return 'Giao hàng'
      case 'general_inquiry': return 'Câu hỏi chung'
      case 'complaint': return 'Khiếu nại'
      case 'technical_support': return 'Hỗ trợ kỹ thuật'
      default: return category
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleString('vi-VN')
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A'
    const now = new Date()
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'N/A'
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Vừa xong'
    if (diffInHours < 24) return `${diffInHours}h trước`
    return `${Math.floor(diffInHours / 24)}d trước`
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    const date = new Date(dueDate)
    if (Number.isNaN(date.getTime())) return false
    return date < new Date()
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol md={8}>
          <h2>{t('support.tickets')}</h2>
          <p className="text-muted">Quản lý ticket hỗ trợ khách hàng</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="primary" onClick={() => setCreateModalOpen(true)}>
            Create Ticket
          </CButton>
        </CCol>
      </CRow>

      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}
      {success && <CAlert color="success" className="mb-4">{success}</CAlert>}

      {/* Statistics */}
      <CRow className="mb-4">
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-primary">{stats.totalTickets}</h4>
              <p className="text-muted mb-0">Total Tickets</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-danger">{stats.openTickets}</h4>
              <p className="text-muted mb-0">Open</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-warning">{stats.inProgressTickets}</h4>
              <p className="text-muted mb-0">In Progress</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-info">{stats.resolvedTickets}</h4>
              <p className="text-muted mb-0">Resolved</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-success">{stats.closedTickets}</h4>
              <p className="text-muted mb-0">Closed</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-secondary">{stats.escalatedTickets}</h4>
              <p className="text-muted mb-0">Escalated</p>
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
                placeholder={t('common.search') + '..."'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect value={statusFilter} onChange={(e) => handleStatusFilterChange(e.target.value)}>
                <option value="all">{t('common.all')} {t('common.status')}</option>
                <option value="open">Mở</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
                <option value="escalated">Chuyển cấp</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={priorityFilter} onChange={(e) => handlePriorityFilterChange(e.target.value)}>
                <option value="all">Tất cả mức độ</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={categoryFilter} onChange={(e) => handleCategoryFilterChange(e.target.value)}>
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={assigneeFilter} onChange={(e) => handleAssigneeFilterChange(e.target.value)}>
                <option value="all">Tất cả người phụ trách</option>
                {assignees.map(assignee => (
                  <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={1}>
              <CButton color="secondary" variant="outline" onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPriorityFilter('all')
                setCategoryFilter('all')
                setAssigneeFilter('all')
                loadTickets({ reset: true, search: '', status: 'all', priority: 'all', category: 'all', assignedTo: 'all', page: 1 })
              }}>
                Reset
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Tickets Table */}
      <CCard>
        <CCardHeader>
          <strong>Support Tickets ({pagination.total || filteredTickets.length})</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-5 text-muted">Không có ticket nào</div>
          ) : (
            <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Ticket ID</CTableHeaderCell>
                  <CTableHeaderCell>{t('users.customer')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('support.subject')}</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>{t('support.priority')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.status')}</CTableHeaderCell>
                  <CTableHeaderCell>Assigned To</CTableHeaderCell>
                  <CTableHeaderCell>Due Date</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.actions')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredTickets.map((ticket) => {
                  const ticketId = ticket._id || ticket.id
                  const ticketNumber = ticket.ticketNumber || ticketId || ''
                  return (
                  <CTableRow key={ticketId}>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{ticketNumber}</div>
                        <small className="text-muted">{getTimeAgo(ticket.createdAt)}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <CAvatar
                          src={ticket.customerAvatar}
                          size="sm"
                          className="me-2"
                        />
                        <div>
                          <div style={{ fontWeight: 500 }}>{ticket.customerName}</div>
                          <small className="text-muted">{ticket.customerEmail}</small>
                          {ticket.orderId && (
                            <div>
                              <small className="text-info">Order: {ticket.orderId}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{ticket.subject}</div>
                        <div style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {ticket.description}
                        </div>
                        <small className="text-muted">{ticket.replies.length} replies</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>{getCategoryText(ticket.category)}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getPriorityColor(ticket.priority)}>
                        {getPriorityText(ticket.priority)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusColor(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        {ticket.assignedTo?.name ? (
                          <small className="text-success">{ticket.assignedTo.name}</small>
                        ) : ticket.assignedTo?.id ? (
                          <small className="text-success">{ticket.assignedTo.id}</small>
                        ) : (
                          <small className="text-muted">Unassigned</small>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div className={isOverdue(ticket.dueDate) ? 'text-danger' : ''}>
                          {formatDate(ticket.dueDate)}
                        </div>
                        {isOverdue(ticket.dueDate) && (
                          <small className="text-danger">Overdue</small>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex flex-column gap-1">
                        <CButton 
                          size="sm" 
                          color="info" 
                          variant="outline" 
                          onClick={() => openTicketDetail(ticket)}
                        >
                          {t('common.view')}
                        </CButton>
                        {ticket.status === 'open' && (
                          <CButton 
                            size="sm" 
                            color="warning" 
                            variant="outline" 
                            onClick={() => handleStatusChange(ticketId, 'in_progress')}
                            disabled={saving}
                          >
                            Start
                          </CButton>
                        )}
                        {ticket.status === 'in_progress' && (
                          <CButton 
                            size="sm" 
                            color="success" 
                            variant="outline" 
                            onClick={() => handleStatusChange(ticketId, 'resolved')}
                            disabled={saving}
                          >
                            Resolve
                          </CButton>
                        )}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                )})}
              </CTableBody>
            </CTable>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <small className="text-muted">
                    Trang {pagination.page} / {pagination.pages} (Tổng: {pagination.total} tickets)
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadTickets({ page: Math.max(1, pagination.page - 1) })}
                    disabled={pagination.page === 1 || loading}
                  >
                    Trước
                  </CButton>
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadTickets({ page: Math.min(pagination.pages, pagination.page + 1) })}
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

      {/* Ticket Detail Modal */}
      <CModal visible={modalOpen} onClose={closeModal} size="xl" backdrop="static">
        <CModalHeader>
          <CModalTitle>Ticket Details - {selectedTicket?.ticketNumber || selectedTicket?._id}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedTicket && (
            <CRow className="g-4">
              {/* Customer Info */}
              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>Customer Information</strong></CCardHeader>
                  <CCardBody>
                    <div className="d-flex align-items-center">
                      <CAvatar
                        src={selectedTicket.customerAvatar}
                        size="lg"
                        className="me-3"
                      />
                      <div>
                        <h5>{selectedTicket.customerName}</h5>
                        <p className="text-muted mb-1">{selectedTicket.customerEmail}</p>
                        <p className="text-muted mb-0">Customer ID: {selectedTicket.customerId}</p>
                        {selectedTicket.orderId && (
                          <p className="text-info mb-0">Order ID: {selectedTicket.orderId}</p>
                        )}
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Ticket Content */}
              <CCol md={8}>
                <CCard>
                  <CCardHeader>
                    <strong>Ticket Details</strong>
                    <div className="float-end">
                      <CBadge color={getPriorityColor(selectedTicket.priority)} className="me-2">
                        {getPriorityText(selectedTicket.priority)}
                      </CBadge>
                      <CBadge color={getStatusColor(selectedTicket.status)}>
                        {getStatusText(selectedTicket.status)}
                      </CBadge>
                    </div>
                  </CCardHeader>
                  <CCardBody>
                    <div className="mb-3">
                      <h5>{selectedTicket.subject}</h5>
                      <p>{selectedTicket.description}</p>
                    </div>
                    
                    {selectedTicket.attachments.length > 0 && (
                      <div>
                        <strong>Attachments:</strong>
                        <div className="mt-2">
                          {selectedTicket.attachments.map((file, idx) => (
                            <CBadge key={idx} color="info" className="me-2">
                              {file}
                            </CBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTicket.tags.length > 0 && (
                      <div className="mt-3">
                        <strong>Tags:</strong>
                        <div className="mt-1">
                          {selectedTicket.tags.map((tag, idx) => (
                            <CBadge key={idx} color="secondary" className="me-1">
                              {tag}
                            </CBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTicket.resolution && (
                      <div className="mt-3">
                        <strong>Resolution:</strong>
                        <p className="mt-2">{selectedTicket.resolution}</p>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Ticket Info */}
              <CCol md={4}>
                <CCard>
                  <CCardHeader><strong>Ticket Information</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>Category:</strong> {getCategoryText(selectedTicket.category)}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Created:</strong> {formatDate(selectedTicket.createdAt)}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Updated:</strong> {formatDate(selectedTicket.updatedAt)}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Due Date:</strong> 
                        <span className={isOverdue(selectedTicket.dueDate) ? 'text-danger ms-2' : 'ms-2'}>
                          {formatDate(selectedTicket.dueDate)}
                        </span>
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Assigned To:</strong> 
                        {selectedTicket.assignedTo?.name ? (
                          <span className="text-success ms-2">{selectedTicket.assignedTo.name}</span>
                        ) : selectedTicket.assignedTo?.id ? (
                          <span className="text-success ms-2">{selectedTicket.assignedTo.id}</span>
                        ) : (
                          <span className="text-muted ms-2">Unassigned</span>
                        )}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Time Spent:</strong> {selectedTicket.timeSpent} minutes
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Replies:</strong> {selectedTicket.replies.length}
                      </CListGroupItem>
                      {selectedTicket.satisfaction && (
                        <CListGroupItem>
                          <strong>Satisfaction:</strong> 
                          <span className="ms-2">{selectedTicket.satisfaction}/5</span>
                        </CListGroupItem>
                      )}
                    </CListGroup>
                    <div className="mt-3">
                      <CFormLabel>Assign To</CFormLabel>
                      <CFormSelect
                        value={selectedTicket.assignedTo?.id || ''}
                        onChange={(e) => handleAssignTo(selectedTicket._id, e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Chọn người phụ trách</option>
                        {assignees.map(agent => (
                          <option key={agent.id || agent} value={agent.id || agent}>
                            {agent.name || agent.id || agent}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Conversation History */}
              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>Conversation History</strong></CCardHeader>
                  <CCardBody>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {(selectedTicket.replies || []).map((reply, index) => (
                        <div key={reply.createdAt || index} className={`mb-3 p-3 rounded ${reply.isAdmin ? 'bg-light' : 'bg-primary text-white'}`}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>{reply.senderName}</strong>
                              <small className="text-muted ms-2">{formatDate(reply.createdAt)}</small>
                            </div>
                          </div>
                          <div className="mt-2">{reply.message}</div>
                        </div>
                      ))}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Reply Form */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>Reply to Customer</strong></CCardHeader>
                  <CCardBody>
                    <CTextarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={4}
                    />
                    <div className="mt-3">
                      <CButton 
                        color="primary" 
                        onClick={() => handleReply(selectedTicket._id)}
                        disabled={saving || !replyText.trim()}
                      >
                        {saving ? 'Sending...' : t('support.reply')}
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Resolution Form */}
              <CCol md={6}>
                <CCard>
                  <CCardHeader><strong>Resolution</strong></CCardHeader>
                  <CCardBody>
                    <CTextarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Describe the resolution..."
                      rows={4}
                    />
                    <div className="mt-3">
                      <CButton 
                        color="success" 
                        onClick={() => handleResolve(selectedTicket._id)}
                        disabled={saving || !resolutionText.trim()}
                      >
                        {saving ? 'Resolving...' : 'Mark as Resolved'}
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
          {selectedTicket && selectedTicket.status === 'open' && (
            <CButton 
              color="warning" 
              onClick={() => handleStatusChange(selectedTicket._id, 'in_progress')}
              disabled={saving}
            >
              Start Processing
            </CButton>
          )}
          {selectedTicket && selectedTicket.status === 'in_progress' && (
            <CButton 
              color="success" 
              onClick={() => handleStatusChange(selectedTicket._id, 'resolved')}
              disabled={saving}
            >
              Mark as Resolved
            </CButton>
          )}
        </CModalFooter>
      </CModal>

      {/* Create Ticket Modal */}
      <CModal visible={createModalOpen} onClose={() => setCreateModalOpen(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Create New Ticket</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormInput
                label="Customer Name"
                value={newTicket.customerName}
                onChange={(e) => setNewTicket(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Customer Email"
                type="email"
                value={newTicket.customerEmail}
                onChange={(e) => setNewTicket(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="customer@email.com"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="Subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter ticket subject"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormTextarea
                label="Description"
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue..."
                rows={4}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label="Category"
                value={newTicket.category}
                onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label="Priority"
                value={newTicket.priority}
                onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </CFormSelect>
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="Order ID (Optional)"
                value={newTicket.orderId}
                onChange={(e) => setNewTicket(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="ORD001"
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleCreateTicket} disabled={saving}>
            {saving ? 'Creating...' : 'Create Ticket'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default SupportTickets
