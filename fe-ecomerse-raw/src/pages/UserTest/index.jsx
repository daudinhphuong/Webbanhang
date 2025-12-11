import React, { useState } from 'react'
import { getUserProfileTest, updateUserProfileTest } from '@/apis/userService'
import './UserTest.scss'

export default function UserTest() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [profileData, setProfileData] = useState({})

  const testGetProfile = async () => {
    try {
      setLoading(true)
      setMessage('')
      
      const response = await getUserProfileTest()
      console.log('Profile response:', response)
      setProfileData(response.data)
      setMessage('✅ Lấy thông tin profile thành công!')
    } catch (error) {
      console.error('Error getting profile:', error)
      setMessage('❌ Lỗi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testUpdateProfile = async () => {
    try {
      setLoading(true)
      setMessage('')
      
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+84 123 456 789',
        address: 'Test Address'
      }
      
      const response = await updateUserProfileTest(testData)
      console.log('Update response:', response)
      setMessage('✅ Cập nhật profile thành công!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('❌ Lỗi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-test-page">
      <div className="container">
        <h1>User API Test</h1>
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="test-buttons">
          <button 
            onClick={testGetProfile} 
            disabled={loading}
            className="test-btn"
          >
            {loading ? 'Testing...' : 'Test Get Profile'}
          </button>
          
          <button 
            onClick={testUpdateProfile} 
            disabled={loading}
            className="test-btn"
          >
            {loading ? 'Testing...' : 'Test Update Profile'}
          </button>
        </div>

        {Object.keys(profileData).length > 0 && (
          <div className="profile-data">
            <h3>Profile Data:</h3>
            <pre>{JSON.stringify(profileData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
