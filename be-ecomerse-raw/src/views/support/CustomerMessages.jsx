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

const CustomerMessages = () => {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [replyText, setReplyText] = useState('')
  
  const supportAgents = [
    { id: 'admin1', name: 'Admin Support' },
    { id: 'admin2', name: 'Support Team' },
    { id: 'manager1', name: 'Manager' },
    { id: 'tech1', name: 'Technical Support' }
  ]

  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    inProgressMessages: 0,
    resolvedMessages: 0,
    closedMessages: 0,
    averageRepliesPerMessage: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0
  })

  const [channels, setChannels] = useState([])
  const [priorities, setPriorities] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [initialized, setInitialized] = useState(false)

  const loadMessages = async (overrides = {}) => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: overrides.page ?? (overrides.reset ? 1 : pagination.page) ?? 1,
        limit: overrides.limit ?? pagination.limit ?? 20,
        search: overrides.search ?? searchTerm ?? '',
        status: overrides.status ?? statusFilter ?? 'all',
        channel: overrides.channel ?? channelFilter ?? 'all',
        priority: overrides.priority ?? priorityFilter ?? 'all'
      }

      const res = await axiosClient.get('/support/customer-messages', { params })
      const response = res?.data || {}
      const responseStats = response.stats || {}

      setMessages(response.data || [])
      setStats({
        totalMessages: responseStats.totalMessages || 0,
        unreadMessages: responseStats.unreadMessages || 0,
        inProgressMessages: responseStats.inProgressMessages || 0,
        resolvedMessages: responseStats.resolvedMessages || 0,
        closedMessages: responseStats.closedMessages || 0,
        averageRepliesPerMessage: responseStats.averageRepliesPerMessage || 0,
        averageResponseTime: responseStats.averageResponseTime || 0,
        customerSatisfaction: responseStats.customerSatisfaction || 0
      })
      setChannels(responseStats.channels || [])
      setPriorities(responseStats.priorities || [])
      setPagination({
        page: response.pagination?.page || params.page,
        limit: response.pagination?.limit || params.limit,
        total: response.pagination?.total || (response.data?.length || 0),
        pages: response.pagination?.pages || 1
      })
      setInitialized(true)
    } catch (e) {
      const message = e?.response?.data?.message || 'Không tải được tin nhắn khách hàng'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMessages({ reset: true }) }, [])

  useEffect(() => {
    if (!initialized) return
    const handler = setTimeout(() => {
      loadMessages({ search: searchTerm, page: 1 })
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    loadMessages({ status: value, page: 1 })
  }

  const handleChannelFilterChange = (value) => {
    setChannelFilter(value)
    loadMessages({ channel: value, page: 1 })
  }

  const handlePriorityFilterChange = (value) => {
    setPriorityFilter(value)
    loadMessages({ priority: value, page: 1 })
  }

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      setSaving(true)
      await axiosClient.patch(`/support/customer-messages/${messageId}`, { status: newStatus })
      setSuccess(`Tin nhắn đã được cập nhật thành ${getStatusText(newStatus)}!`)
      setTimeout(() => setSuccess(''), 3000)
      await loadMessages()
      if (selectedMessage && (selectedMessage._id === messageId || selectedMessage.id === messageId)) {
        const detailRes = await axiosClient.get(`/support/customer-messages/${messageId}`)
        setSelectedMessage(detailRes.data)
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi cập nhật trạng thái tin nhắn'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignTo = async (messageId, assigneeId) => {
    try {
      setSaving(true)
      if (!assigneeId) {
        await axiosClient.patch(`/support/customer-messages/${messageId}`, {
          assignedTo: null
        })
        setSuccess('Tin nhắn đã được bỏ phân công!')
        setTimeout(() => setSuccess(''), 3000)
        await loadMessages()
        if (selectedMessage && (selectedMessage._id === messageId || selectedMessage.id === messageId)) {
          const detailRes = await axiosClient.get(`/support/customer-messages/${messageId}`)
          setSelectedMessage(detailRes.data)
        }
        return
      }
      const agent = supportAgents.find((item) => item.id === assigneeId)
      await axiosClient.patch(`/support/customer-messages/${messageId}`, {
        assignedTo: agent
          ? { id: agent.id, name: agent.name }
          : { id: assigneeId, name: assigneeId },
      })
      setSuccess('Tin nhắn đã được phân công!')
      setTimeout(() => setSuccess(''), 3000)
      await loadMessages()
      if (selectedMessage && (selectedMessage._id === messageId || selectedMessage.id === messageId)) {
        const detailRes = await axiosClient.get(`/support/customer-messages/${messageId}`)
        setSelectedMessage(detailRes.data)
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi phân công tin nhắn'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      setError('Vui lòng nhập phản hồi')
      return
    }

    try {
      setSaving(true)
      await axiosClient.post(`/support/customer-messages/${messageId}/replies`, {
        message: replyText.trim(),
        isAdmin: true
      })

      setReplyText('')
      setSuccess('Phản hồi đã được gửi!')
      setTimeout(() => setSuccess(''), 3000)
      await loadMessages()
      if (selectedMessage && (selectedMessage._id === messageId || selectedMessage.id === messageId)) {
        const detailRes = await axiosClient.get(`/support/customer-messages/${messageId}`)
        setSelectedMessage(detailRes.data)
      }
    } catch (e) {
      const message = e?.response?.data?.message || 'Lỗi khi gửi phản hồi'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const openMessageDetail = async (message) => {
    setReplyText('')
    setModalOpen(true)
    setSelectedMessage(message)
    try {
      const res = await axiosClient.get(`/support/customer-messages/${message._id || message.id}`)
      setSelectedMessage(res.data)
    } catch (e) {
      setSelectedMessage(message)
      const messageText = e?.response?.data?.message || 'Không thể tải chi tiết tin nhắn'
      setError(messageText)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedMessage(null)
    setReplyText('')
  }

  const filteredMessages = messages

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'danger'
      case 'in_progress': return 'warning'
      case 'resolved': return 'success'
      default: return 'secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'unread': return 'Chưa đọc'
      case 'in_progress': return 'Đang xử lý'
      case 'resolved': return 'Đã giải quyết'
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

  const getChannelText = (channel) => {
    switch (channel) {
      case 'live_chat': return 'Live Chat'
      case 'email': return 'Email'
      default: return channel
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Vừa xong'
    if (diffInHours < 24) return `${diffInHours}h trước`
    return `${Math.floor(diffInHours / 24)}d trước`
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol md={8}>
          <h2>{t('support.messages')}</h2>
          <p className="text-muted">Quản lý tin nhắn và hỗ trợ khách hàng</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="info" variant="outline">
            Export Messages
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
              <h4 className="text-primary">{stats.totalMessages}</h4>
              <p className="text-muted mb-0">Total Messages</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-danger">{stats.unreadMessages}</h4>
              <p className="text-muted mb-0">Unread</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-warning">{stats.inProgressMessages}</h4>
              <p className="text-muted mb-0">In Progress</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-success">{stats.resolvedMessages}</h4>
              <p className="text-muted mb-0">Resolved</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-info">{stats.averageResponseTime}h</h4>
              <p className="text-muted mb-0">Avg Response</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={2}>
          <CCard className="text-center">
            <CCardBody>
              <h4 className="text-success">{stats.customerSatisfaction}/5</h4>
              <p className="text-muted mb-0">Satisfaction</p>
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
              <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('common.status')}</option>
                <option value="unread">Chưa đọc</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
                <option value="all">{t('common.all')} Channels</option>
                <option value="live_chat">Live Chat</option>
                <option value="email">Email</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('support.priority')}</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CButton color="secondary" variant="outline" onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setChannelFilter('all')
                setPriorityFilter('all')
                loadMessages({ reset: true, search: '', status: 'all', channel: 'all', priority: 'all', page: 1 })
              }}>
                {t('common.reset')}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Messages Table */}
      <CCard>
        <CCardHeader>
          <strong>{t('support.messages')} ({pagination.total || filteredMessages.length})</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-5 text-muted">Không có tin nhắn nào</div>
          ) : (
            <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>{t('users.customer')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('support.subject')}</CTableHeaderCell>
                  <CTableHeaderCell>Channel</CTableHeaderCell>
                  <CTableHeaderCell>{t('support.priority')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.status')}</CTableHeaderCell>
                  <CTableHeaderCell>Assigned To</CTableHeaderCell>
                  <CTableHeaderCell>Time</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.actions')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredMessages.map((message) => {
                  const messageId = message._id || message.id
                  return (
                  <CTableRow key={messageId}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <CAvatar
                          src={message.customerAvatar}
                          size="sm"
                          className="me-2"
                        />
                        <div>
                          <div style={{ fontWeight: 500 }}>{message.customerName}</div>
                          <small className="text-muted">{message.customerEmail}</small>
                          {message.orderId && (
                            <div>
                              <small className="text-info">Order: {message.orderId}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{message.subject}</div>
                        <div style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {message.message}
                        </div>
                        {message.attachments.length > 0 && (
                          <small className="text-info">{message.attachments.length} files</small>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={message.channel === 'live_chat' ? 'success' : 'info'}>
                        {getChannelText(message.channel)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getPriorityColor(message.priority)}>
                        {getPriorityText(message.priority)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusColor(message.status)}>
                        {getStatusText(message.status)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        {message.assignedTo?.name ? (
                          <small className="text-success">{message.assignedTo.name}</small>
                        ) : message.assignedTo?.id ? (
                          <small className="text-success">{message.assignedTo.id}</small>
                        ) : (
                          <small className="text-muted">Unassigned</small>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{getTimeAgo(message.createdAt)}</div>
                        <small className="text-muted">{formatDate(message.createdAt)}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex flex-column gap-1">
                        <CButton 
                          size="sm" 
                          color="info" 
                          variant="outline" 
                          onClick={() => openMessageDetail(message)}
                        >
                          {t('common.view')}
                        </CButton>
                        {message.status === 'unread' && (
                          <CButton 
                            size="sm" 
                            color="warning" 
                            variant="outline" 
                            onClick={() => handleStatusChange(messageId, 'in_progress')}
                            disabled={saving}
                          >
                            Start
                          </CButton>
                        )}
                        {message.status === 'in_progress' && (
                          <CButton 
                            size="sm" 
                            color="success" 
                            variant="outline" 
                            onClick={() => handleStatusChange(messageId, 'resolved')}
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
                    Trang {pagination.page} / {pagination.pages} (Tổng: {pagination.total} tin nhắn)
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadMessages({ page: Math.max(1, pagination.page - 1) })}
                    disabled={pagination.page === 1 || loading}
                  >
                    Trước
                  </CButton>
                  <CButton 
                    color="secondary" 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadMessages({ page: Math.min(pagination.pages, pagination.page + 1) })}
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

      {/* Message Detail Modal */}
      <CModal visible={modalOpen} onClose={closeModal} size="xl" backdrop="static">
        <CModalHeader>
          <CModalTitle>Message Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedMessage && (
            <CRow className="g-4">
              {/* Customer Info */}
              <CCol md={12}>
                <CCard>
                  <CCardHeader><strong>Customer Information</strong></CCardHeader>
                  <CCardBody>
                    <div className="d-flex align-items-center">
                      <CAvatar
                        src={selectedMessage.customerAvatar}
                        size="lg"
                        className="me-3"
                      />
                      <div>
                        <h5>{selectedMessage.customerName}</h5>
                        <p className="text-muted mb-1">{selectedMessage.customerEmail}</p>
                        <p className="text-muted mb-0">Customer ID: {selectedMessage.customerId}</p>
                        {selectedMessage.orderId && (
                          <p className="text-info mb-0">Order ID: {selectedMessage.orderId}</p>
                        )}
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Message Content */}
              <CCol md={8}>
                <CCard>
                  <CCardHeader>
                    <strong>Message Content</strong>
                    <div className="float-end">
                      <CBadge color={getPriorityColor(selectedMessage.priority)} className="me-2">
                        {getPriorityText(selectedMessage.priority)}
                      </CBadge>
                      <CBadge color={getStatusColor(selectedMessage.status)}>
                        {getStatusText(selectedMessage.status)}
                      </CBadge>
                    </div>
                  </CCardHeader>
                  <CCardBody>
                    <div className="mb-3">
                      <h5>{selectedMessage.subject}</h5>
                      <p>{selectedMessage.message}</p>
                    </div>
                    
                    {selectedMessage.attachments.length > 0 && (
                      <div>
                        <strong>Attachments:</strong>
                        <div className="mt-2">
                          {selectedMessage.attachments.map((file, idx) => (
                            <CBadge key={idx} color="info" className="me-2">
                              {file}
                            </CBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMessage.tags.length > 0 && (
                      <div className="mt-3">
                        <strong>Tags:</strong>
                        <div className="mt-1">
                          {selectedMessage.tags.map((tag, idx) => (
                            <CBadge key={idx} color="secondary" className="me-1">
                              {tag}
                            </CBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Message Info */}
              <CCol md={4}>
                <CCard>
                  <CCardHeader><strong>Message Information</strong></CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <strong>Channel:</strong> {getChannelText(selectedMessage.channel)}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Created:</strong> {formatDate(selectedMessage.createdAt)}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Last Activity:</strong> {formatDate(selectedMessage.lastActivity)}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Assigned To:</strong> 
                        {selectedMessage.assignedTo?.name ? (
                          <span className="text-success ms-2">{selectedMessage.assignedTo.name}</span>
                        ) : selectedMessage.assignedTo?.id ? (
                          <span className="text-success ms-2">{selectedMessage.assignedTo.id}</span>
                        ) : (
                          <span className="text-muted ms-2">Unassigned</span>
                        )}
                      </CListGroupItem>
                      <CListGroupItem>
                        <strong>Replies:</strong> {selectedMessage.replies.length}
                      </CListGroupItem>
                    </CListGroup>
                    <div className="mt-3">
                      <CFormLabel>Assign To</CFormLabel>
                      <CFormSelect
                        value={selectedMessage.assignedTo?.id || ''}
                        onChange={(e) => handleAssignTo(selectedMessage._id || selectedMessage.id, e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Chọn người phụ trách</option>
                        {supportAgents.map(agent => (
                          <option key={agent.id} value={agent.id}>{agent.name}</option>
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
                      {(selectedMessage.replies || []).map((reply, index) => (
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
              <CCol md={12}>
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
                        onClick={() => handleReply(selectedMessage._id || selectedMessage.id)}
                        disabled={saving || !replyText.trim() || !(selectedMessage._id || selectedMessage.id)}
                      >
                        {saving ? 'Sending...' : t('support.reply')}
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
          {selectedMessage && selectedMessage.status === 'unread' && (
            <CButton 
              color="warning" 
              onClick={() => handleStatusChange(selectedMessage._id || selectedMessage.id, 'in_progress')}
              disabled={saving || !(selectedMessage._id || selectedMessage.id)}
            >
              Start Processing
            </CButton>
          )}
          {selectedMessage && selectedMessage.status === 'in_progress' && (
            <CButton 
              color="success" 
              onClick={() => handleStatusChange(selectedMessage._id || selectedMessage.id, 'resolved')}
              disabled={saving || !(selectedMessage._id || selectedMessage.id)}
            >
              Mark as Resolved
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CustomerMessages
