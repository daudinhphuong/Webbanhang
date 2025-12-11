import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import MyHeader from '@components/Header/Header';
import MyFooter from '@components/Footer/Footer';
import MainLayout from '@components/Layout/Layout';
import Button from '@components/Button/Button';
import { getMyMessages, replyCustomerMessage, getMessageDetail } from '@/apis/customerMessageService';
import { getMyTickets, createTicket, replyTicket, getTicketDetail } from '@/apis/supportTicketService';
import styles from '@/pages/AboutUs/styles.module.scss';
import './Support.scss';

function Support() {
  const {
    container,
    functionBox,
    specialText,
    btnBack,
    containerTitle,
    line,
    title,
    textS,
    textL,
    containerContent,
    des,
  } = styles;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'tickets'
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReply, setMessageReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState('');
  const [sendingTicketReply, setSendingTicketReply] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general_inquiry',
    priority: 'medium',
    orderId: ''
  });
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    const userId = Cookies.get('userId');
    if (!userId) {
      navigate('/');
      return;
    }
    loadMessages();
    loadTickets();
  }, [navigate]);

  const loadMessages = async () => {
    try {
      setMessagesLoading(true);
      const res = await getMyMessages();
      const list = res?.data?.data ?? res?.data ?? [];
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error loading messages:', e);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await getMyTickets();
      const list = res?.data?.data ?? res?.data ?? [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error loading tickets:', e);
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleBackPreviousPage = () => {
    window.history.back();
  };

  const handleSendMessageReply = async (messageId) => {
    if (!messageReply.trim()) return;
    try {
      setSendingReply(true);
      const res = await replyCustomerMessage(messageId, {
        message: messageReply.trim(),
        isAdmin: false
      });
      setMessageReply('');
      // Reload message detail
      if (res?.data?.data) {
        setSelectedMessage(res.data.data);
      } else {
        // Fallback: reload from API
        const detailRes = await getMessageDetail(messageId);
        setSelectedMessage(detailRes.data);
      }
      await loadMessages();
      alert('Phản hồi đã được gửi!');
    } catch (e) {
      console.error('Error sending reply:', e);
      alert('Lỗi khi gửi phản hồi: ' + (e.response?.data?.message || e.message));
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      setCreatingTicket(true);
      await createTicket(newTicket);
      setNewTicket({
        subject: '',
        description: '',
        category: 'general_inquiry',
        priority: 'medium',
        orderId: ''
      });
      setShowCreateTicket(false);
      await loadTickets();
      alert('Yêu cầu hỗ trợ đã được tạo!');
    } catch (e) {
      console.error('Error creating ticket:', e);
      alert('Lỗi khi tạo yêu cầu: ' + (e.response?.data?.message || e.message));
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleTicketReply = async (ticketId) => {
    if (!ticketReply.trim()) return;
    try {
      setSendingTicketReply(true);
      const res = await replyTicket(ticketId, { message: ticketReply.trim() });
      setTicketReply('');
      // Reload ticket detail
      if (res?.data?.data) {
        setSelectedTicket(res.data.data);
      } else {
        // Fallback: reload from API
        const detailRes = await getTicketDetail(ticketId);
        setSelectedTicket(detailRes.data);
      }
      await loadTickets();
      alert('Phản hồi đã được gửi!');
    } catch (e) {
      console.error('Error sending ticket reply:', e);
      alert('Lỗi khi gửi phản hồi: ' + (e.response?.data?.message || e.message));
    } finally {
      setSendingTicketReply(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { text: 'Mở', color: '#667eea', icon: '🔵' },
      in_progress: { text: 'Đang xử lý', color: '#f59e0b', icon: '🟡' },
      resolved: { text: 'Đã giải quyết', color: '#10b981', icon: '✅' },
      closed: { text: 'Đã đóng', color: '#6b7280', icon: '🔒' },
      unread: { text: 'Chưa đọc', color: '#ef4444', icon: '🔴' },
      in_progress_msg: { text: 'Đang xử lý', color: '#f59e0b', icon: '🟡' },
      resolved_msg: { text: 'Đã giải quyết', color: '#10b981', icon: '✅' },
    };
    const statusInfo = statusMap[status] || { text: status, color: '#6b7280', icon: '⚪' };
    return (
      <span className="status-badge" style={{
        backgroundColor: statusInfo.color + '15',
        color: statusInfo.color,
        border: `1px solid ${statusInfo.color}30`
      }}>
        <span>{statusInfo.icon}</span>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <>
      <MyHeader />
      <MainLayout>
        <div className={container}>
          <div className={functionBox}>
            <div>
              Home {'>'} <span className={specialText}>Hỗ trợ khách hàng</span>
            </div>
            <div className={btnBack} onClick={handleBackPreviousPage}>
              ← Quay lại
            </div>
          </div>

          <div className={containerTitle}>
            <div className={line}></div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              onClick={() => setActiveTab('messages')}
              className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
            >
              💬 Tin nhắn khách hàng
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
            >
              🎫 Yêu cầu hỗ trợ
            </button>
          </div>

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className={containerContent}>
              {messagesLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <div className="loading-text">Đang tải tin nhắn...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <div className="empty-title">Chưa có tin nhắn nào</div>
                  <div className="empty-description">
                    Bạn chưa gửi tin nhắn nào đến admin. Hãy sử dụng form liên hệ để gửi tin nhắn.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {messages.map((msg) => (
                    <div
                      key={msg._id || msg.id}
                      className="message-card"
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
                              {msg.subject || 'Không có chủ đề'}
                            </h3>
                            {getStatusBadge(msg.status)}
                          </div>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '15px', lineHeight: 1.7 }}>
                            {msg.message?.substring(0, 150)}...
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                            📅 {formatDate(msg.createdAt)}
                          </span>
                          {msg.replies && msg.replies.length > 0 && (
                            <span style={{ fontSize: '13px', color: '#667eea', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                              💬 {msg.replies.length} phản hồi
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>👆 Click để xem chi tiết</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className={containerContent}>
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
                    Quản lý ticket hỗ trợ
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    Tạo và theo dõi các yêu cầu hỗ trợ của bạn
                  </p>
                </div>
                <button
                  className="create-ticket-button"
                  onClick={() => setShowCreateTicket(true)}
                >
                  ✨ Tạo yêu cầu mới
                </button>
              </div>

              {ticketsLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <div className="loading-text">Đang tải tickets...</div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎫</div>
                  <div className="empty-title">Chưa có yêu cầu hỗ trợ nào</div>
                  <div className="empty-description">
                    Tạo yêu cầu hỗ trợ mới để được hỗ trợ nhanh chóng từ đội ngũ của chúng tôi
                  </div>
                  <button
                    className="create-ticket-button"
                    onClick={() => setShowCreateTicket(true)}
                    style={{ marginTop: 24 }}
                  >
                    ✨ Tạo yêu cầu đầu tiên
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id || ticket.id}
                      className="ticket-card"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
                              {ticket.subject || 'Không có chủ đề'}
                            </h3>
                            {ticket.ticketNumber && (
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#667eea', 
                                padding: '4px 10px', 
                                background: 'rgba(102, 126, 234, 0.1)', 
                                borderRadius: 8,
                                fontWeight: 600,
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                              }}>
                                #{ticket.ticketNumber}
                              </span>
                            )}
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '15px', lineHeight: 1.7, marginBottom: 12 }}>
                            {ticket.description?.substring(0, 150)}...
                          </p>
                          {ticket.category && (
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                                📁 {ticket.category.replace('_', ' ')}
                              </span>
                              {ticket.priority && (
                                <span style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  ⚡ {ticket.priority}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                            📅 {formatDate(ticket.createdAt)}
                          </span>
                          {ticket.replies && ticket.replies.length > 0 && (
                            <span style={{ fontSize: '13px', color: '#667eea', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                              💬 {ticket.replies.length} phản hồi
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>👆 Click để xem chi tiết</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message Detail Modal */}
          {selectedMessage && (
            <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{selectedMessage.subject || 'Chi tiết tin nhắn'}</h2>
                  <button className="close-button" onClick={() => setSelectedMessage(null)}>
                    ×
                  </button>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ 
                    padding: 20, 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                    borderRadius: 12,
                    marginBottom: 20
                  }}>
                    <p style={{ margin: 0, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '15px' }}>
                      {selectedMessage.message}
                    </p>
                  </div>
                  <div style={{ 
                    padding: 16, 
                    background: '#f8f9fa', 
                    borderRadius: 12,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>👤 Người gửi:</strong> {selectedMessage.customerName || 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>📧 Email:</strong> {selectedMessage.customerEmail || 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>📅 Ngày gửi:</strong> {formatDate(selectedMessage.createdAt)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>📊 Trạng thái:</strong> {getStatusBadge(selectedMessage.status)}
                    </div>
                  </div>
                </div>
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ marginBottom: 16, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                      💬 Phản hồi ({selectedMessage.replies.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedMessage.replies.map((reply, idx) => (
                        <div key={idx} style={{ 
                          padding: 16, 
                          background: reply.isAdmin ? 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' : '#f9fafb', 
                          borderRadius: 12,
                          borderLeft: `4px solid ${reply.isAdmin ? '#667eea' : '#10b981'}`
                        }}>
                          <div style={{ 
                            fontSize: '13px', 
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <strong style={{ color: '#1f2937' }}>{reply.senderName || 'Admin'}</strong>
                            <span style={{ color: '#9ca3af' }}>•</span>
                            <span style={{ color: '#6b7280' }}>{formatDate(reply.createdAt || reply.sentAt)}</span>
                            {reply.isAdmin && (
                              <span style={{ 
                                padding: '2px 8px', 
                                background: '#667eea', 
                                color: '#fff', 
                                borderRadius: 4,
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{reply.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="reply-section">
                  <textarea
                    value={messageReply}
                    onChange={(e) => setMessageReply(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                    rows={4}
                  />
                  <Button
                    content={sendingReply ? '⏳ Đang gửi...' : '📤 Gửi phản hồi'}
                    onClick={() => handleSendMessageReply(selectedMessage._id || selectedMessage.id)}
                    disabled={sendingReply || !messageReply.trim()}
                    style={{ 
                      width: '100%', 
                      padding: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: '15px',
                      cursor: sendingReply || !messageReply.trim() ? 'not-allowed' : 'pointer',
                      opacity: sendingReply || !messageReply.trim() ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ticket Detail Modal */}
          {selectedTicket && (
            <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{selectedTicket.subject || 'Chi tiết yêu cầu'}</h2>
                  <button className="close-button" onClick={() => setSelectedTicket(null)}>
                    ×
                  </button>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ 
                    padding: 20, 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                    borderRadius: 12,
                    marginBottom: 20
                  }}>
                    <p style={{ margin: 0, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '15px' }}>
                      {selectedTicket.description}
                    </p>
                  </div>
                  <div style={{ 
                    padding: 16, 
                    background: '#f8f9fa', 
                    borderRadius: 12,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>🎫 Mã ticket:</strong> {selectedTicket.ticketNumber || 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>📁 Danh mục:</strong> {selectedTicket.category?.replace('_', ' ') || 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>⚡ Độ ưu tiên:</strong> {selectedTicket.priority || 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>📊 Trạng thái:</strong> {getStatusBadge(selectedTicket.status)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <strong style={{ color: '#1f2937' }}>📅 Ngày tạo:</strong> {formatDate(selectedTicket.createdAt)}
                    </div>
                    {selectedTicket.orderId && (
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        <strong style={{ color: '#1f2937' }}>📦 Mã đơn:</strong> {selectedTicket.orderId}
                      </div>
                    )}
                  </div>
                </div>
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ marginBottom: 16, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                      💬 Phản hồi ({selectedTicket.replies.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedTicket.replies.map((reply, idx) => (
                        <div key={idx} style={{ 
                          padding: 16, 
                          background: reply.isAdmin ? 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' : '#f9fafb', 
                          borderRadius: 12,
                          borderLeft: `4px solid ${reply.isAdmin ? '#667eea' : '#10b981'}`
                        }}>
                          <div style={{ 
                            fontSize: '13px', 
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <strong style={{ color: '#1f2937' }}>{reply.senderName || 'Admin'}</strong>
                            <span style={{ color: '#9ca3af' }}>•</span>
                            <span style={{ color: '#6b7280' }}>{formatDate(reply.createdAt || reply.sentAt)}</span>
                            {reply.isAdmin && (
                              <span style={{ 
                                padding: '2px 8px', 
                                background: '#667eea', 
                                color: '#fff', 
                                borderRadius: 4,
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{reply.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedTicket.status !== 'closed' && (
                  <div className="reply-section">
                    <textarea
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      placeholder="Nhập phản hồi của bạn..."
                      rows={4}
                    />
                    <Button
                      content={sendingTicketReply ? '⏳ Đang gửi...' : '📤 Gửi phản hồi'}
                      onClick={() => handleTicketReply(selectedTicket._id || selectedTicket.id)}
                      disabled={sendingTicketReply || !ticketReply.trim()}
                      style={{ 
                        width: '100%', 
                        padding: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: '15px',
                        cursor: sendingTicketReply || !ticketReply.trim() ? 'not-allowed' : 'pointer',
                        opacity: sendingTicketReply || !ticketReply.trim() ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Ticket Modal */}
          {showCreateTicket && (
            <div className="modal-overlay" onClick={() => setShowCreateTicket(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>✨ Tạo yêu cầu hỗ trợ mới</h2>
                  <button className="close-button" onClick={() => setShowCreateTicket(false)}>
                    ×
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 10, 
                      fontWeight: 600,
                      color: '#1f2937',
                      fontSize: '14px'
                    }}>
                      📝 Chủ đề *
                    </label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      placeholder="Nhập chủ đề yêu cầu hỗ trợ"
                      style={{
                        width: '100%',
                        padding: 14,
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '15px',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 10, 
                      fontWeight: 600,
                      color: '#1f2937',
                      fontSize: '14px'
                    }}>
                      📄 Mô tả chi tiết *
                    </label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder="Mô tả chi tiết vấn đề của bạn để chúng tôi có thể hỗ trợ tốt nhất..."
                      rows={6}
                      style={{
                        width: '100%',
                        padding: 14,
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '15px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        outline: 'none',
                        lineHeight: 1.6
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 10, 
                        fontWeight: 600,
                        color: '#1f2937',
                        fontSize: '14px'
                      }}>
                        📁 Danh mục
                      </label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        style={{
                          width: '100%',
                          padding: 14,
                          border: '2px solid #e5e7eb',
                          borderRadius: 12,
                          fontSize: '15px',
                          background: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="general_inquiry">💬 Câu hỏi chung</option>
                        <option value="product_issue">📦 Vấn đề sản phẩm</option>
                        <option value="refund">💰 Hoàn tiền</option>
                        <option value="shipping">🚚 Vận chuyển</option>
                        <option value="complaint">⚠️ Khiếu nại</option>
                        <option value="technical_support">🔧 Hỗ trợ kỹ thuật</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 10, 
                        fontWeight: 600,
                        color: '#1f2937',
                        fontSize: '14px'
                      }}>
                        ⚡ Độ ưu tiên
                      </label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        style={{
                          width: '100%',
                          padding: 14,
                          border: '2px solid #e5e7eb',
                          borderRadius: 12,
                          fontSize: '15px',
                          background: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="low">🟢 Thấp</option>
                        <option value="medium">🟡 Trung bình</option>
                        <option value="high">🔴 Cao</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 10, 
                      fontWeight: 600,
                      color: '#1f2937',
                      fontSize: '14px'
                    }}>
                      📦 Mã đơn hàng (nếu có)
                    </label>
                    <input
                      type="text"
                      value={newTicket.orderId}
                      onChange={(e) => setNewTicket({ ...newTicket, orderId: e.target.value })}
                      placeholder="Nhập mã đơn hàng liên quan (tùy chọn)"
                      style={{
                        width: '100%',
                        padding: 14,
                        border: '2px solid #e5e7eb',
                        borderRadius: 12,
                        fontSize: '15px',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: 12, 
                    marginTop: 8,
                    paddingTop: 20,
                    borderTop: '2px solid #f3f4f6'
                  }}>
                    <button
                      onClick={() => setShowCreateTicket(false)}
                      style={{ 
                        flex: 1, 
                        padding: '14px', 
                        background: '#f3f4f6',
                        color: '#6b7280',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleCreateTicket}
                      disabled={creatingTicket || !newTicket.subject.trim() || !newTicket.description.trim()}
                      style={{ 
                        flex: 1, 
                        padding: '14px',
                        background: creatingTicket || !newTicket.subject.trim() || !newTicket.description.trim()
                          ? '#cbd5e1'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: '15px',
                        cursor: creatingTicket || !newTicket.subject.trim() || !newTicket.description.trim()
                          ? 'not-allowed'
                          : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: creatingTicket || !newTicket.subject.trim() || !newTicket.description.trim()
                          ? 'none'
                          : '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!creatingTicket && newTicket.subject.trim() && newTicket.description.trim()) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!creatingTicket && newTicket.subject.trim() && newTicket.description.trim()) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }
                      }}
                    >
                      {creatingTicket ? '⏳ Đang tạo...' : '✨ Tạo yêu cầu'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
      <MyFooter />
    </>
  );
}

export default Support;

