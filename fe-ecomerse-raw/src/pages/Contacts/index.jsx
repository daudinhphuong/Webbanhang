import React, { useState, useEffect, useContext } from 'react'
import MyHeader from '@components/Header/Header'
import MainLayout from '@components/Layout/Layout'
import MyFooter from '@components/Footer/Footer'
import { getShopSettings } from '@/apis/settingsService'
import { sendCustomerMessage } from '@/apis/customerMessageService'
import { StoreContext } from '@/contexts/storeProvider'
import './Contacts.scss'

export default function Contacts() {
  const { userInfo } = useContext(StoreContext)
  const [shopSettings, setShopSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        const response = await getShopSettings()
        setShopSettings(response.data)
      } catch (error) {
        console.error('Error fetching shop settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShopSettings()
  }, [])

  // Tự động điền thông tin nếu user đã login
  useEffect(() => {
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || userInfo.name || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || '',
        email: prev.email || userInfo.email || '',
        phone: prev.phone || userInfo.phone || ''
      }))
    }
  }, [userInfo])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập họ tên'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ'
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Vui lòng nhập chủ đề'
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Vui lòng nhập nội dung tin nhắn'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      // Chuẩn bị dữ liệu gửi đến API
      const messageData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        channel: 'email',
        priority: 'medium'
      }

      // Thêm customerId nếu user đã login
      if (userInfo?._id) {
        messageData.customerId = userInfo._id
      }

      // Thêm customerAvatar nếu có
      if (userInfo?.avatar) {
        messageData.customerAvatar = userInfo.avatar
      }

      await sendCustomerMessage(messageData)
      
      setSubmitStatus('success')
      setFormData({
        name: userInfo ? (userInfo.name || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || '') : '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting contact form:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gửi tin nhắn'
      setSubmitStatus('error')
      setFormErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <MyHeader />
        <MainLayout>
          <div className="contacts-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin liên hệ...</p>
          </div>
        </MainLayout>
        <MyFooter />
      </>
    )
  }

  return (
    <>
      <MyHeader />
      <MainLayout>
        <div className="contacts-page">
          {/* Hero Section */}
          <div className="contacts-hero">
            <div className="contacts-hero-content">
              <h1 className="contacts-hero-title">Liên hệ với chúng tôi</h1>
              <p className="contacts-hero-subtitle">
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi để được tư vấn tốt nhất.
              </p>
            </div>
          </div>

          <div className="contacts-content">
            <div className="contacts-grid">
              {/* Contact Information */}
              <div className="contact-info-section">
                <h2 className="section-title">Thông tin liên hệ</h2>
                
                <div className="contact-info-cards">
                  <div className="contact-info-card">
                    <div className="contact-icon">
                      <span>📍</span>
                    </div>
                    <div className="contact-details">
                      <h3>Địa chỉ</h3>
                      <p>{shopSettings?.address || 'Chưa cập nhật địa chỉ'}</p>
                    </div>
                  </div>

                  <div className="contact-info-card">
                    <div className="contact-icon">
                      <span>📞</span>
                    </div>
                    <div className="contact-details">
                      <h3>Điện thoại</h3>
                      <p>{shopSettings?.phone || 'Chưa cập nhật số điện thoại'}</p>
                    </div>
                  </div>

                  <div className="contact-info-card">
                    <div className="contact-icon">
                      <span>✉️</span>
                    </div>
                    <div className="contact-details">
                      <h3>Email</h3>
                      <p>{shopSettings?.email || shopSettings?.contactEmail || 'Chưa cập nhật email'}</p>
                    </div>
                  </div>

                  <div className="contact-info-card">
                    <div className="contact-icon">
                      <span>🕒</span>
                    </div>
                    <div className="contact-details">
                      <h3>Giờ làm việc</h3>
                      <p>{shopSettings?.workingHours || 'Chưa cập nhật giờ làm việc'}</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="social-media-section">
                  <h3>Kết nối với chúng tôi</h3>
                  <div className="social-links">
                    {shopSettings?.socialMedia?.facebook && (
                      <a href={shopSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                        <span>📘</span> Facebook
                      </a>
                    )}
                    {shopSettings?.socialMedia?.instagram && (
                      <a href={shopSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                        <span>📷</span> Instagram
                      </a>
                    )}
                    {shopSettings?.socialMedia?.twitter && (
                      <a href={shopSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                        <span>🐦</span> Twitter
                      </a>
                    )}
                    {shopSettings?.socialMedia?.youtube && (
                      <a href={shopSettings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                        <span>📺</span> YouTube
                      </a>
                    )}
                    {(!shopSettings?.socialMedia?.facebook && !shopSettings?.socialMedia?.instagram && !shopSettings?.socialMedia?.twitter && !shopSettings?.socialMedia?.youtube) && (
                      <div className="no-social-media">
                        <p>Chưa có liên kết mạng xã hội</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-section">
                <h2 className="section-title">Gửi tin nhắn</h2>
                
                {userInfo && (
                  <div className="info-message" style={{ 
                    padding: '12px', 
                    backgroundColor: '#e7f3ff', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: '#0066cc'
                  }}>
                    <span>ℹ️</span> Bạn đã đăng nhập. Thông tin của bạn đã được tự động điền. Admin sẽ nhận được tin nhắn và phản hồi sớm nhất.
                  </div>
                )}
                
                {submitStatus === 'success' && (
                  <div className="success-message">
                    <span>✅</span>
                    <p>Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm nhất.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="error-message">
                    <span>❌</span>
                    <p>{formErrors.submit || 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.'}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Họ và tên *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={formErrors.name ? 'error' : ''}
                        placeholder="Nhập họ và tên của bạn"
                      />
                      {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? 'error' : ''}
                        placeholder="Nhập địa chỉ email"
                      />
                      {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={formErrors.phone ? 'error' : ''}
                        placeholder="Nhập số điện thoại"
                      />
                      {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Chủ đề *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={formErrors.subject ? 'error' : ''}
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="general">Thông tin chung</option>
                        <option value="product">Sản phẩm</option>
                        <option value="order">Đơn hàng</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                        <option value="complaint">Khiếu nại</option>
                        <option value="other">Khác</option>
                      </select>
                      {formErrors.subject && <span className="error-text">{formErrors.subject}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Nội dung tin nhắn *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className={formErrors.message ? 'error' : ''}
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                      rows="5"
                    />
                    {formErrors.message && <span className="error-text">{formErrors.message}</span>}
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="btn-spinner"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        Gửi tin nhắn
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Map Section */}
            <div className="map-section">
              <h2 className="section-title">Vị trí cửa hàng</h2>
              <div className="map-container">
                <div className="map-placeholder">
                  <div className="map-content">
                    <div className="map-icon">🗺️</div>
                    <h3>Bản đồ cửa hàng</h3>
                    <p>Địa chỉ: {shopSettings?.address || 'Chưa cập nhật địa chỉ'}</p>
                    <button className="view-map-btn">Xem bản đồ</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
      <MyFooter />
    </>
  )
}
