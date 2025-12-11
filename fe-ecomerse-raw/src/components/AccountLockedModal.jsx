import React from 'react'
import Cookies from 'js-cookie'

const AccountLockedModal = ({ visible, onClose }) => {
  if (!visible) return null

  const handleLogout = () => {
    // Clear all auth cookies
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    Cookies.remove('userId')
    // Redirect to login page
    window.location.href = '/login'
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 style={{ marginTop: 0, color: '#dc3545' }}>
          🔒 Tài khoản đã bị khóa
        </h2>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#721c24'
        }}>
          <strong>Tài khoản của bạn đã bị khóa.</strong>
          <br />
          Vui lòng liên hệ hỗ trợ để được hỗ trợ thêm.
        </div>
        <p style={{ marginBottom: '1.5rem' }}>
          Bạn cần đăng xuất khỏi hệ thống. Vui lòng nhấn nút "Đăng xuất" bên dưới.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountLockedModal

