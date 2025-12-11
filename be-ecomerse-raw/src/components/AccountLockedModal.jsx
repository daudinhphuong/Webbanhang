import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import Cookies from 'js-cookie'

const AccountLockedModal = ({ visible, onClose }) => {
  const handleLogout = () => {
    // Clear all auth cookies
    Cookies.remove('admin_token')
    Cookies.remove('admin_refreshToken')
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    // Redirect to login page
    window.location.href = '/login'
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
      <CModalHeader>
        <CModalTitle>
          <CIcon icon={cilLockLocked} className="me-2" />
          Tài khoản đã bị khóa
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CAlert color="danger">
          <strong>Tài khoản của bạn đã bị khóa.</strong>
          <br />
          Vui lòng liên hệ hỗ trợ để được hỗ trợ thêm.
        </CAlert>
        <p className="mt-3">
          Bạn cần đăng xuất khỏi hệ thống. Vui lòng nhấn nút "Đăng xuất" bên dưới.
        </p>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleLogout}>
          Đăng xuất
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default AccountLockedModal

