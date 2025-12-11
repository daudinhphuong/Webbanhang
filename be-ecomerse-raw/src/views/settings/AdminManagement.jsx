import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CButton, CAlert, CRow, CCol, CFormInput, 
  CFormTextarea, CFormSelect, CSpinner, CForm, CFormLabel, CFormCheck, 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge,
  CInputGroup, CInputGroupText, CProgress, CListGroup, CListGroupItem
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'

const AdminManagement = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  
  const [admins, setAdmins] = useState([
    {
      id: 1,
      username: 'admin',
      name: 'Super Admin',
      email: 'admin@shop.com',
      role: 'super_admin',
      permissions: ['all'],
      isActive: true,
      lastLogin: '2024-01-07T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      loginCount: 156
    },
    {
      id: 2,
      username: 'manager1',
      name: 'Store Manager',
      email: 'manager@shop.com',
      role: 'manager',
      permissions: ['products', 'orders', 'customers', 'analytics'],
      isActive: true,
      lastLogin: '2024-01-07T09:15:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      loginCount: 89
    },
    {
      id: 3,
      username: 'staff1',
      name: 'Support Staff',
      email: 'staff@shop.com',
      role: 'staff',
      permissions: ['orders', 'customers'],
      isActive: true,
      lastLogin: '2024-01-06T16:45:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      loginCount: 45
    },
    {
      id: 4,
      username: 'moderator1',
      name: 'Content Moderator',
      email: 'moderator@shop.com',
      role: 'moderator',
      permissions: ['products', 'categories', 'brands'],
      isActive: false,
      lastLogin: '2024-01-05T14:20:00Z',
      createdAt: '2024-01-04T00:00:00Z',
      loginCount: 23
    }
  ])

  const [adminForm, setAdminForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'staff',
    permissions: [],
    isActive: true
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [roles, setRoles] = useState([
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full access to all features',
      permissions: ['all']
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Management access to most features',
      permissions: ['products', 'orders', 'customers', 'analytics', 'settings']
    },
    {
      id: 'staff',
      name: 'Staff',
      description: 'Limited access to orders and customers',
      permissions: ['orders', 'customers']
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Content management access',
      permissions: ['products', 'categories', 'brands', 'about']
    }
  ])

  const [permissions, setPermissions] = useState([
    { id: 'all', name: 'All Permissions', description: 'Full system access' },
    { id: 'products', name: 'Products', description: 'Manage products, categories, brands' },
    { id: 'orders', name: 'Orders', description: 'Manage orders and returns' },
    { id: 'customers', name: 'Customers', description: 'Manage customer accounts' },
    { id: 'analytics', name: 'Analytics', description: 'View reports and analytics' },
    { id: 'settings', name: 'Settings', description: 'System configuration' },
    { id: 'users', name: 'User Management', description: 'Manage admin users' },
    { id: 'discounts', name: 'Discounts', description: 'Manage coupons and campaigns' },
    { id: 'about', name: 'Content', description: 'Manage about pages and content' }
  ])

  const loadAdmins = async () => {
    setLoading(true)
    try {
      // Mock data - in real app, this would be API call
      // Data is already initialized above
    } catch (e) {
      setError('Không tải được danh sách admin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadAdmins()
    // Set current user (mock)
    setCurrentUser({
      id: 1,
      username: 'admin',
      name: 'Super Admin',
      role: 'super_admin'
    })
  }, [])

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setAdminForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field) => (e) => {
    setPasswordForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handlePermissionChange = (permissionId) => (e) => {
    if (e.target.checked) {
      setAdminForm(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId]
      }))
    } else {
      setAdminForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permissionId)
      }))
    }
  }

  const openAddAdmin = () => {
    setEditingAdmin(null)
    setAdminForm({
      username: '',
      name: '',
      email: '',
      password: '',
      role: 'staff',
      permissions: [],
      isActive: true
    })
    setModalOpen(true)
  }

  const openEditAdmin = (admin) => {
    setEditingAdmin(admin)
    setAdminForm({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive
    })
    setModalOpen(true)
  }

  const saveAdmin = async () => {
    if (!adminForm.username || !adminForm.name || !adminForm.email) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (!editingAdmin && !adminForm.password) {
      setError('Vui lòng nhập mật khẩu cho admin mới')
      return
    }

    try {
      const newAdmin = {
        id: editingAdmin ? editingAdmin.id : Date.now(),
        ...adminForm,
        lastLogin: editingAdmin ? editingAdmin.lastLogin : null,
        createdAt: editingAdmin ? editingAdmin.createdAt : new Date().toISOString(),
        loginCount: editingAdmin ? editingAdmin.loginCount : 0
      }

      if (editingAdmin) {
        setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? newAdmin : a))
      } else {
        setAdmins(prev => [...prev, newAdmin])
      }

      setModalOpen(false)
      setSuccess('Admin account saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Lỗi khi lưu admin account')
    }
  }

  const deleteAdmin = (adminId) => {
    if (adminId === currentUser?.id) {
      setError('Không thể xóa tài khoản của chính bạn')
      return
    }

    if (window.confirm('Are you sure you want to delete this admin account?')) {
      setAdmins(prev => prev.filter(a => a.id !== adminId))
      setSuccess('Admin account deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const toggleAdminStatus = (adminId) => {
    if (adminId === currentUser?.id) {
      setError('Không thể vô hiệu hóa tài khoản của chính bạn')
      return
    }

    setAdmins(prev => prev.map(a => 
      a.id === adminId ? { ...a, isActive: !a.isActive } : a
    ))
  }

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu mới không khớp')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    try {
      // In real app, this would be API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordModalOpen(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Mật khẩu đã được thay đổi thành công!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Lỗi khi thay đổi mật khẩu')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'danger'
      case 'manager': return 'warning'
      case 'staff': return 'info'
      case 'moderator': return 'secondary'
      default: return 'light'
    }
  }

  const getRoleName = (role) => {
    const roleObj = roles.find(r => r.id === role)
    return roleObj ? roleObj.name : role
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol md={8}>
          <h2>Admin Management</h2>
          <p className="text-muted">Quản lý tài khoản admin và phân quyền</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="primary" onClick={openAddAdmin}>
            Add Admin
          </CButton>
        </CCol>
      </CRow>

      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}
      {success && <CAlert color="success" className="mb-4">{success}</CAlert>}

      <CRow>
        {/* Admin List */}
        <CCol md={8}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Admin Accounts</strong>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Admin</CTableHeaderCell>
                      <CTableHeaderCell>Role</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Last Login</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {admins.map((admin) => (
                      <CTableRow key={admin.id}>
                        <CTableDataCell>
                          <div>
                            <div style={{ fontWeight: 500 }}>{admin.name}</div>
                            <small className="text-muted">{admin.username} • {admin.email}</small>
                            {admin.id === currentUser?.id && (
                              <CBadge color="primary" className="ms-2">You</CBadge>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getRoleColor(admin.role)}>
                            {getRoleName(admin.role)}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={admin.isActive ? 'success' : 'secondary'}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <div>{admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}</div>
                            <small className="text-muted">{admin.loginCount} logins</small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            size="sm" 
                            color="info" 
                            variant="outline" 
                            onClick={() => openEditAdmin(admin)}
                            className="me-1"
                          >
                            Edit
                          </CButton>
                          <CButton 
                            size="sm" 
                            color={admin.isActive ? 'warning' : 'success'} 
                            variant="outline" 
                            onClick={() => toggleAdminStatus(admin.id)}
                            className="me-1"
                            disabled={admin.id === currentUser?.id}
                          >
                            {admin.isActive ? 'Disable' : 'Enable'}
                          </CButton>
                          <CButton 
                            size="sm" 
                            color="danger" 
                            variant="outline" 
                            onClick={() => deleteAdmin(admin.id)}
                            disabled={admin.id === currentUser?.id}
                          >
                            Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Current User Info & Actions */}
        <CCol md={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Your Account</strong>
            </CCardHeader>
            <CCardBody>
              {currentUser && (
                <CListGroup flush>
                  <CListGroupItem>
                    <strong>Name:</strong> {currentUser.name}
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Username:</strong> {currentUser.username}
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Role:</strong> 
                    <CBadge color={getRoleColor(currentUser.role)} className="ms-2">
                      {getRoleName(currentUser.role)}
                    </CBadge>
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Permissions:</strong> All
                  </CListGroupItem>
                </CListGroup>
              )}
              <div className="mt-3">
                <CButton 
                  color="warning" 
                  variant="outline" 
                  onClick={() => setPasswordModalOpen(true)}
                  className="w-100"
                >
                  Change Password
                </CButton>
              </div>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Role Permissions</strong>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush>
                {roles.map((role) => (
                  <CListGroupItem key={role.id}>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        <CBadge color={getRoleColor(role.id)} className="me-2">
                          {role.name}
                        </CBadge>
                      </div>
                      <small className="text-muted">{role.description}</small>
                    </div>
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Admin Modal */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} backdrop="static" size="lg">
        <CModalHeader>
          <CModalTitle>{editingAdmin ? 'Edit Admin' : 'Add Admin'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormInput
                label="Username"
                value={adminForm.username}
                onChange={handleInputChange('username')}
                placeholder="admin_username"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Full Name"
                value={adminForm.name}
                onChange={handleInputChange('name')}
                placeholder="Admin Name"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="Email"
                type="email"
                value={adminForm.email}
                onChange={handleInputChange('email')}
                placeholder="admin@shop.com"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormInput
                label={editingAdmin ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                value={adminForm.password}
                onChange={handleInputChange('password')}
                placeholder="Enter password"
                required={!editingAdmin}
              />
            </CCol>
            <CCol md={12}>
              <CFormSelect
                label="Role"
                value={adminForm.role}
                onChange={handleInputChange('role')}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={12}>
              <CFormCheck
                id="isActive"
                label="Active Account"
                checked={adminForm.isActive}
                onChange={handleInputChange('isActive')}
              />
            </CCol>
            <CCol md={12}>
              <div>
                <strong>Permissions:</strong>
                <div className="mt-2">
                  {permissions.map((permission) => (
                    <CFormCheck
                      key={permission.id}
                      id={`permission-${permission.id}`}
                      label={permission.name}
                      checked={adminForm.permissions.includes(permission.id)}
                      onChange={handlePermissionChange(permission.id)}
                      className="mb-1"
                    />
                  ))}
                </div>
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={saveAdmin}>
            {editingAdmin ? 'Update Admin' : 'Add Admin'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Password Change Modal */}
      <CModal visible={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Change Password</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormInput
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                placeholder="Enter current password"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange('newPassword')}
                placeholder="Enter new password"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                placeholder="Confirm new password"
                required
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setPasswordModalOpen(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={changePassword}>
            Change Password
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AdminManagement
