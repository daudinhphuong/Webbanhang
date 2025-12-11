import React, { useState, useEffect, useContext } from 'react'
import MyHeader from '@components/Header/Header'
import MainLayout from '@components/Layout/Layout'
import MyFooter from '@components/Footer/Footer'
import { getUserProfile, updateUserProfile, changePassword, uploadAvatar } from '@/apis/userService'
import { StoreContext } from '@/contexts/storeProvider'
import './UserSettings.scss'

export default function UserSettings() {
  const { userInfo, setUserInfo } = useContext(StoreContext)
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState('')
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    avatar: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setMessage('')
      
      // Try to get from API first
      try {
        const response = await getUserProfile()
        const profileData = response.data || {}
        
        setUserProfile({
          username: profileData.username || '',
          email: profileData.email || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          dateOfBirth: profileData.dateOfBirth || '',
          gender: profileData.gender || '',
          avatar: profileData.avatar || ''
        })
        
        // Update userInfo in context if available
        if (setUserInfo && profileData) {
          setUserInfo(prev => ({ ...prev, ...profileData }))
        }
      } catch (apiError) {
        console.warn('API not available, using userInfo from context:', apiError.message)
        
        // Fallback to userInfo from context
        if (userInfo) {
          setUserProfile({
            username: userInfo.username || '',
            email: userInfo.email || '',
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || '',
            phone: userInfo.phone || '',
            address: userInfo.address || '',
            dateOfBirth: userInfo.dateOfBirth || '',
            gender: userInfo.gender || '',
            avatar: userInfo.avatar || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      setMessage('Lỗi khi tải thông tin người dùng: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage('')
      
      // Prepare data to send (exclude username as it shouldn't be changed)
      const updateData = {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        address: userProfile.address,
        dateOfBirth: userProfile.dateOfBirth,
        gender: userProfile.gender
      }
      
      const response = await updateUserProfile(updateData)
      
      if (response.data?.success) {
        setMessage('✅ Cập nhật thông tin thành công!')
        
        // Update userInfo in context
        if (setUserInfo && response.data?.data) {
          setUserInfo(prev => ({ ...prev, ...response.data.data }))
        }
        
        // Reload profile to get latest data
        await loadUserProfile()
      } else {
        setMessage('✅ Cập nhật thông tin thành công!')
      }
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('❌ Lỗi khi cập nhật thông tin: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ Mật khẩu mới không khớp')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage('❌ Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    
    try {
      setLoading(true)
      setMessage('')
      
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      setMessage('✅ Đổi mật khẩu thành công!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage('❌ Lỗi khi đổi mật khẩu: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Vui lòng chọn file ảnh')
      return
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Kích thước ảnh không được vượt quá 5MB')
      return
    }
    
    try {
      setUploadingAvatar(true)
      setMessage('')
      
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await uploadAvatar(formData)
      
      if (response.data?.success) {
        // Update avatar in state
        const newAvatarUrl = response.data?.data?.avatar || userProfile.avatar
        setUserProfile(prev => ({ ...prev, avatar: newAvatarUrl }))
        
        // Update userInfo in context
        if (setUserInfo) {
          setUserInfo(prev => ({ ...prev, avatar: newAvatarUrl }))
        }
        
        setMessage('✅ Cập nhật ảnh đại diện thành công!')
      } else {
        setMessage('✅ Cập nhật ảnh đại diện thành công!')
      }
      
      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage('❌ Lỗi khi cập nhật ảnh đại diện: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <>
      <MyHeader />
      <MainLayout>
        <div className="user-settings-page">
          <div className="settings-container">
            <div className="settings-header">
              <h1>Cài đặt tài khoản</h1>
              <p>Quản lý thông tin cá nhân và bảo mật tài khoản</p>
            </div>

            {message && (
              <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="settings-content">
              {/* Navigation Tabs */}
              <div className="settings-nav">
                <button 
                  className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <span>👤</span> Thông tin cá nhân
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <span>🔒</span> Bảo mật
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'preferences' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <span>⚙️</span> Tùy chọn
                </button>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="settings-tab">
                  <div className="tab-header">
                    <h2>Thông tin cá nhân</h2>
                    <p>Cập nhật thông tin cá nhân của bạn</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="avatar-section">
                      <div className="avatar-container">
                        <div className="avatar-preview">
                          {userProfile.avatar ? (
                            <img src={userProfile.avatar} alt="Avatar" />
                          ) : (
                            <div className="avatar-placeholder">
                              <span>👤</span>
                            </div>
                          )}
                        </div>
                        <div className="avatar-actions">
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            style={{ display: 'none' }}
                          />
                          <label 
                            htmlFor="avatar-upload" 
                            className={`upload-btn ${uploadingAvatar ? 'uploading' : ''}`}
                          >
                            {uploadingAvatar ? '⏳ Đang tải...' : '📷 Thay đổi ảnh'}
                          </label>
                          {userProfile.avatar && (
                            <button
                              type="button"
                              className="remove-avatar-btn"
                              onClick={async () => {
                                try {
                                  // Update in state first
                                  setUserProfile(prev => ({ ...prev, avatar: '' }))
                                  if (setUserInfo) {
                                    setUserInfo(prev => ({ ...prev, avatar: '' }))
                                  }
                                  // TODO: Call API to remove avatar from backend
                                  setMessage('✅ Đã xóa ảnh đại diện')
                                } catch (error) {
                                  console.error('Error removing avatar:', error)
                                  setMessage('❌ Lỗi khi xóa ảnh đại diện')
                                }
                              }}
                            >
                              🗑️ Xóa ảnh
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">Họ *</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={userProfile.firstName}
                          onChange={handleProfileChange}
                          placeholder="Nhập họ của bạn"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Tên *</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={userProfile.lastName}
                          onChange={handleProfileChange}
                          placeholder="Nhập tên của bạn"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={userProfile.username}
                          disabled
                          className="disabled-input"
                          title="Tên đăng nhập không thể thay đổi"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={userProfile.email}
                          onChange={handleProfileChange}
                          placeholder="Nhập email của bạn"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={userProfile.phone}
                          onChange={handleProfileChange}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="dateOfBirth">Ngày sinh</label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={userProfile.dateOfBirth}
                          onChange={handleProfileChange}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">Giới tính</label>
                      <select
                        id="gender"
                        name="gender"
                        value={userProfile.gender}
                        onChange={handleProfileChange}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Địa chỉ</label>
                      <textarea
                        id="address"
                        name="address"
                        value={userProfile.address}
                        onChange={handleProfileChange}
                        placeholder="Nhập địa chỉ của bạn"
                        rows="3"
                      />
                    </div>

                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? 'Đang lưu...' : '💾 Lưu thông tin'}
                    </button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="settings-tab">
                  <div className="tab-header">
                    <h2>🔒 Thay đổi mật khẩu</h2>
                    <p>Bảo vệ tài khoản của bạn bằng cách thay đổi mật khẩu định kỳ</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="security-form">
                    <div className="form-group">
                      <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">Mật khẩu mới *</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                      />
                    </div>

                    <div className="password-requirements">
                      <h4>Yêu cầu mật khẩu:</h4>
                      <ul>
                        <li>Ít nhất 6 ký tự</li>
                        <li>Nên bao gồm chữ hoa, chữ thường và số</li>
                        <li>Không sử dụng thông tin cá nhân</li>
                      </ul>
                    </div>

                    <button type="submit" className="save-btn" disabled={loading}>
                      {loading ? 'Đang xử lý...' : '🔒 Đổi mật khẩu'}
                    </button>
                  </form>
                </div>
              )}

              {/* Preferences Tab - Hidden for now */}
              {activeTab === 'preferences' && (
                <div className="settings-tab">
                  <div className="tab-header">
                    <h2>⚙️ Tùy chọn</h2>
                    <p>Tính năng này đang được phát triển</p>
                  </div>

                  <div className="coming-soon">
                    <div className="coming-soon-icon">🚧</div>
                    <h3>Tính năng đang phát triển</h3>
                    <p>Các tùy chọn cá nhân sẽ được cập nhật trong phiên bản tiếp theo.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
      <MyFooter />
    </>
  )
}
