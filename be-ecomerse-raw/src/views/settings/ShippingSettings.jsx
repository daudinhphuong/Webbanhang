import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CButton, CAlert, CRow, CCol, CFormInput, 
  CFormTextarea, CFormSelect, CSpinner, CForm, CFormLabel, CFormCheck, 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'

const ShippingSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  
  const [settings, setSettings] = useState({
    defaultShippingFee: 30000,
    freeShippingThreshold: 500000,
    allowFreeShipping: true,
    shippingMethods: ['standard', 'express', 'overnight'],
    defaultMethod: 'standard',
    processingTime: 1,
    allowPickup: true,
    pickupLocations: [],
    allowInternational: false,
    internationalFee: 100000,
    weightLimit: 30, // kg
    dimensionLimit: 120, // cm
    insuranceRequired: false,
    signatureRequired: false,
    allowCOD: true,
    codFee: 0
  })

  const [shippingZones, setShippingZones] = useState([
    {
      id: 1,
      name: 'Ho Chi Minh City',
      cities: ['Quan 1', 'Quan 2', 'Quan 3', 'Quan 4', 'Quan 5'],
      fee: 20000,
      freeThreshold: 300000,
      estimatedDays: '1-2 days',
      status: 'active'
    },
    {
      id: 2,
      name: 'Hanoi',
      cities: ['Ba Dinh', 'Hoan Kiem', 'Dong Da', 'Hai Ba Trung'],
      fee: 25000,
      freeThreshold: 400000,
      estimatedDays: '2-3 days',
      status: 'active'
    },
    {
      id: 3,
      name: 'Da Nang',
      cities: ['Hai Chau', 'Thanh Khe', 'Son Tra', 'Ngu Hanh Son'],
      fee: 30000,
      freeThreshold: 500000,
      estimatedDays: '3-4 days',
      status: 'active'
    },
    {
      id: 4,
      name: 'Other Cities',
      cities: ['Can Tho', 'Hai Phong', 'Nha Trang', 'Hue'],
      fee: 50000,
      freeThreshold: 800000,
      estimatedDays: '5-7 days',
      status: 'active'
    }
  ])

  const [zoneForm, setZoneForm] = useState({
    name: '',
    cities: '',
    fee: '',
    freeThreshold: '',
    estimatedDays: '',
    status: 'active'
  })

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Mock data - in real app, this would be API call
      const mockSettings = {
        defaultShippingFee: 30000,
        freeShippingThreshold: 500000,
        allowFreeShipping: true,
        shippingMethods: ['standard', 'express', 'overnight'],
        defaultMethod: 'standard',
        processingTime: 1,
        allowPickup: true,
        pickupLocations: ['Store 1', 'Store 2'],
        allowInternational: false,
        internationalFee: 100000,
        weightLimit: 30,
        dimensionLimit: 120,
        insuranceRequired: false,
        signatureRequired: false,
        allowCOD: true,
        codFee: 0
      }
      
      setSettings(mockSettings)
    } catch (e) {
      setError('Không tải được cài đặt vận chuyển')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleZoneInputChange = (field) => (e) => {
    setZoneForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const openAddZone = () => {
    setEditingZone(null)
    setZoneForm({
      name: '',
      cities: '',
      fee: '',
      freeThreshold: '',
      estimatedDays: '',
      status: 'active'
    })
    setModalOpen(true)
  }

  const openEditZone = (zone) => {
    setEditingZone(zone)
    setZoneForm({
      name: zone.name,
      cities: zone.cities.join(', '),
      fee: zone.fee,
      freeThreshold: zone.freeThreshold,
      estimatedDays: zone.estimatedDays,
      status: zone.status
    })
    setModalOpen(true)
  }

  const saveZone = () => {
    const newZone = {
      id: editingZone ? editingZone.id : Date.now(),
      name: zoneForm.name,
      cities: zoneForm.cities.split(',').map(c => c.trim()),
      fee: parseInt(zoneForm.fee),
      freeThreshold: parseInt(zoneForm.freeThreshold),
      estimatedDays: zoneForm.estimatedDays,
      status: zoneForm.status
    }

    if (editingZone) {
      setShippingZones(prev => prev.map(z => z.id === editingZone.id ? newZone : z))
    } else {
      setShippingZones(prev => [...prev, newZone])
    }

    setModalOpen(false)
    setSuccess('Shipping zone saved successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const deleteZone = (zoneId) => {
    if (window.confirm('Are you sure you want to delete this shipping zone?')) {
      setShippingZones(prev => prev.filter(z => z.id !== zoneId))
      setSuccess('Shipping zone deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const toggleZoneStatus = (zoneId) => {
    setShippingZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' } : z
    ))
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // In real app, this would be API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Cài đặt vận chuyển đã được lưu thành công!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError('Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol md={8}>
          <h2>Shipping Settings</h2>
          <p className="text-muted">Cấu hình phí vận chuyển và khu vực giao hàng</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="primary" onClick={openAddZone}>
            Add Shipping Zone
          </CButton>
        </CCol>
      </CRow>

      {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}
      {success && <CAlert color="success" className="mb-4">{success}</CAlert>}

      <CForm onSubmit={saveSettings}>
        <CRow>
          {/* General Settings */}
          <CCol md={6}>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Cài đặt giao hàng </strong>
              </CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  <CCol md={12}>
                    <CFormInput
                      label="Phí Vận chuyển Mặc định (VND)"
                      type="number"
                      value={settings.defaultShippingFee}
                      onChange={handleInputChange('defaultShippingFee')}
                      placeholder="30000"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormInput
                      label="Giảm giá Vận chuyển Miễn phí cho Đơn hàng Trên (VND)"
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={handleInputChange('freeShippingThreshold')}
                      placeholder="500000"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="allowFreeShipping"
                      label="Miễn phí vận chuyển cho đơn hàng đủ điều kiện"
                      checked={settings.allowFreeShipping}
                      onChange={handleInputChange('allowFreeShipping')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormInput
                      label="Ngày giao hàng du kiến (số ngày)"
                      type="number"
                      value={settings.processingTime}
                      onChange={handleInputChange('processingTime')}
                      placeholder="1"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormSelect
                      label="Phương thức vận chuyển "
                      value={settings.defaultMethod}
                      onChange={handleInputChange('defaultMethod')}
                    >
                      <option value="standard">Mặc định</option>
                      <option value="express">Hỏa tốc</option>
                      <option value="overnight">Xuyên đêm</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="allowPickup"
                      label="Nhận hàng tại cửa hàng"
                      checked={settings.allowPickup}
                      onChange={handleInputChange('allowPickup')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="allowCOD"
                      label="Thanh toán khi nhận hàng (COD)"
                      checked={settings.allowCOD}
                      onChange={handleInputChange('allowCOD')}
                    />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* International Shipping */}
            <CCard className="mb-4">
              <CCardHeader>
                <strong>International Shipping</strong>
              </CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  <CCol md={12}>
                    <CFormCheck
                      id="allowInternational"
                      label="Giao hàng quốc tế"
                      checked={settings.allowInternational}
                      onChange={handleInputChange('allowInternational')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormInput
                      label="Phí vận chuyển quốc tế "
                      type="number"
                      value={settings.internationalFee}
                      onChange={handleInputChange('internationalFee')}
                      placeholder="100000"
                      disabled={!settings.allowInternational}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label=" Giới hạn trọng lượng (kg)"
                      type="number"
                      value={settings.weightLimit}
                      onChange={handleInputChange('weightLimit')}
                      placeholder="30"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label="Chiều dài giới hạn (cm)"
                      type="number"
                      value={settings.dimensionLimit}
                      onChange={handleInputChange('dimensionLimit')}
                      placeholder="120"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="insuranceRequired"
                      label="Yêu cầu bảo hiêm vận chuyển"
                      checked={settings.insuranceRequired}
                      onChange={handleInputChange('insuranceRequired')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="signatureRequired"
                      label="Yêu cầu chữ ký khi giao hàng"
                      checked={settings.signatureRequired}
                      onChange={handleInputChange('signatureRequired')}
                    />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Shipping Zones */}
          <CCol md={6}>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Khu vực giao hàng</strong>
              </CCardHeader>
              <CCardBody>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Khu vự </CTableHeaderCell>
                      <CTableHeaderCell>Phí vận chuyển</CTableHeaderCell>
                      <CTableHeaderCell>Giảm giá theo khu vực </CTableHeaderCell>
                      <CTableHeaderCell>Ngày giao hàng dự kiến</CTableHeaderCell>
                      <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                      <CTableHeaderCell>Cài đặt</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {shippingZones.map((zone) => (
                      <CTableRow key={zone.id}>
                        <CTableDataCell>
                          <div>
                            <div style={{ fontWeight: 500 }}>{zone.name}</div>
                            <small className="text-muted">{zone.cities.length} cities</small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{formatCurrency(zone.fee)}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(zone.freeThreshold)}</CTableDataCell>
                        <CTableDataCell>{zone.estimatedDays}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={zone.status === 'active' ? 'success' : 'secondary'}>
                            {zone.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            size="sm" 
                            color="info" 
                            variant="outline" 
                            onClick={() => openEditZone(zone)}
                            className="me-1"
                          >
                            Edit
                          </CButton>
                          <CButton 
                            size="sm" 
                            color={zone.status === 'active' ? 'warning' : 'success'} 
                            variant="outline" 
                            onClick={() => toggleZoneStatus(zone.id)}
                            className="me-1"
                          >
                            {zone.status === 'active' ? 'Disable' : 'Enable'}
                          </CButton>
                          <CButton 
                            size="sm" 
                            color="danger" 
                            variant="outline" 
                            onClick={() => deleteZone(zone.id)}
                          >
                            Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <CRow>
          <CCol className="text-end">
            <CButton 
              type="submit" 
              color="primary" 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </CButton>
          </CCol>
        </CRow>
      </CForm>

      {/* Zone Modal */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editingZone ? 'Edit Shipping Zone' : 'Add Shipping Zone'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormInput
                label="Zone Name"
                value={zoneForm.name}
                onChange={handleZoneInputChange('name')}
                placeholder="e.g., Ho Chi Minh City"
                required
              />
            </CCol>
            <CCol md={12}>
              <CFormTextarea
                label="Cities (comma separated)"
                value={zoneForm.cities}
                onChange={handleZoneInputChange('cities')}
                placeholder="Quan 1, Quan 2, Quan 3"
                rows={3}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Shipping Fee (VND)"
                type="number"
                value={zoneForm.fee}
                onChange={handleZoneInputChange('fee')}
                placeholder="20000"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Free Threshold (VND)"
                type="number"
                value={zoneForm.freeThreshold}
                onChange={handleZoneInputChange('freeThreshold')}
                placeholder="300000"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Estimated Days"
                value={zoneForm.estimatedDays}
                onChange={handleZoneInputChange('estimatedDays')}
                placeholder="1-2 days"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label="Status"
                value={zoneForm.status}
                onChange={handleZoneInputChange('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={saveZone}>
            {editingZone ? 'Update Zone' : 'Add Zone'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ShippingSettings
