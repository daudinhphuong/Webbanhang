import React, { useState, useEffect } from 'react'
import { getShopSettings, updateShopSettingsTest, updateShopSettingsPublic } from '@/apis/settingsService'
import './SettingsTest.scss'

export default function SettingsTest() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    shopName: '',
    email: '',
    phone: '',
    address: '',
    workingHours: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await getShopSettings()
      const data = response.data || {}
      setSettings(data)
      setFormData({
        shopName: data.shopName || '',
        email: data.email || data.contactEmail || '',
        phone: data.phone || '',
        address: data.address || '',
        workingHours: data.workingHours || '',
        socialMedia: {
          facebook: data.socialMedia?.facebook || '',
          instagram: data.socialMedia?.instagram || '',
          twitter: data.socialMedia?.twitter || '',
          youtube: data.socialMedia?.youtube || ''
        }
      })
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage('Lỗi khi tải settings: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('socialMedia.')) {
      const socialKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage('')
      
      const response = await updateShopSettingsPublic(formData)
      console.log('Settings saved:', response.data)
      
      setMessage('✅ Lưu settings thành công!')
      await loadSettings() // Reload settings
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('❌ Lỗi khi lưu settings: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-test-page">
      <div className="container">
        <h1>Test Settings API</h1>
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="settings-grid">
          {/* Current Settings */}
          <div className="current-settings">
            <h2>Current Settings (from DB)</h2>
            <pre>{JSON.stringify(settings, null, 2)}</pre>
          </div>

          {/* Settings Form */}
          <div className="settings-form">
            <h2>Update Settings</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Shop Name:</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  placeholder="Tên cửa hàng"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email liên hệ"
                />
              </div>

              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ cửa hàng"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Working Hours:</label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  placeholder="Giờ làm việc"
                />
              </div>

              <h3>Social Media</h3>
              <div className="form-group">
                <label>Facebook:</label>
                <input
                  type="url"
                  name="socialMedia.facebook"
                  value={formData.socialMedia.facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="form-group">
                <label>Instagram:</label>
                <input
                  type="url"
                  name="socialMedia.instagram"
                  value={formData.socialMedia.instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="form-group">
                <label>Twitter:</label>
                <input
                  type="url"
                  name="socialMedia.twitter"
                  value={formData.socialMedia.twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="form-group">
                <label>YouTube:</label>
                <input
                  type="url"
                  name="socialMedia.youtube"
                  value={formData.socialMedia.youtube}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <button type="submit" disabled={loading} className="save-btn">
                {loading ? 'Đang lưu...' : 'Lưu Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
