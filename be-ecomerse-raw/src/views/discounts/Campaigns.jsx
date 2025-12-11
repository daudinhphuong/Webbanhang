import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CBadge, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CFormTextarea, CAlert,
  CRow, CCol, CFormCheck, CSpinner, CProgress, CListGroup, CListGroupItem
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const Campaigns = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'percentage', // percentage, fixed, bogo
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
    conditions: {
      newCustomersOnly: false,
      minOrderQuantity: '',
      specificCategories: [],
      specificProducts: []
    }
  })


  const load = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/campaigns')
      const data = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : [])
      setItems(data)
    } catch (e) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message
      console.error('ADMIN_CAMPAIGNS_LOAD_ERROR', status, msg)
      if (status === 401) setError('Vui lòng đăng nhập lại (401)')
      else if (status === 403) setError('Bạn không có quyền admin (403)')
      else setError(`Không tải được danh sách campaign${status ? ` (${status})` : ''}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
      conditions: {
        newCustomersOnly: false,
        minOrderQuantity: '',
        specificCategories: [],
        specificProducts: []
      }
    })
  }

  const openCreate = () => {
    setEditing(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (campaign) => {
    setEditing(campaign)
    setForm({
      name: campaign.name || '',
      description: campaign.description || '',
      type: campaign.type || 'percentage',
      value: campaign.value || '',
      minOrderAmount: campaign.minOrderAmount || '',
      maxDiscountAmount: campaign.maxDiscountAmount || '',
      validFrom: campaign.validFrom ? new Date(campaign.validFrom).toISOString().split('T')[0] : '',
      validUntil: campaign.validUntil ? new Date(campaign.validUntil).toISOString().split('T')[0] : '',
      isActive: campaign.isActive !== false,
      conditions: campaign.conditions || {
        newCustomersOnly: false,
        minOrderQuantity: '',
        specificCategories: [],
        specificProducts: []
      }
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        validFrom: form.validFrom ? new Date(form.validFrom) : null,
        validUntil: form.validUntil ? new Date(form.validUntil) : null,
        conditions: {
          ...form.conditions,
          minOrderQuantity: form.conditions.minOrderQuantity ? Number(form.conditions.minOrderQuantity) : null
        }
      }
      
      if (editing) {
        await axiosClient.put(`/campaigns/${editing._id}`, payload)
      } else {
        await axiosClient.post('/campaigns', payload)
      }
      
      setModalOpen(false)
      await load()
    } catch (e) {
      console.error('Error saving campaign:', e)
      setError('Failed to save campaign: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (campaign) => {
    if (!window.confirm('Xóa chiến dịch này?')) return
    try {
      await axiosClient.delete(`/campaigns/${campaign._id}`)
      await load()
    } catch (e) {
      console.error('Error deleting campaign:', e)
      setError('Failed to delete campaign: ' + (e.response?.data?.message || e.message))
    }
  }

  const toggleActive = async (campaign) => {
    try {
      await axiosClient.patch(`/campaigns/${campaign._id}/toggle`)
      await load()
    } catch (e) {
      console.error('Error toggling campaign:', e)
      setError('Failed to toggle campaign status: ' + (e.response?.data?.message || e.message))
    }
  }

  const getStatusColor = (campaign) => {
    const now = new Date()
    if (!campaign.isActive) return 'secondary'
    if (campaign.validUntil && new Date(campaign.validUntil) < now) return 'danger'
    if (campaign.validFrom && new Date(campaign.validFrom) > now) return 'info'
    return 'success'
  }

  const getStatusText = (campaign) => {
    const now = new Date()
    if (!campaign.isActive) return 'Inactive'
    if (campaign.validFrom && new Date(campaign.validFrom) > now) return 'Scheduled'
    if (campaign.validUntil && new Date(campaign.validUntil) < now) return 'Expired'
    return 'Active'
  }

  const filteredItems = items.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const status = getStatusText(campaign)
    const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol><strong>{t('discounts.campaigns')}</strong></CCol>
            <CCol className="text-end">
              <CButton color="primary" onClick={openCreate}>{t('discounts.add')} {t('discounts.campaigns')}</CButton>
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md={4}>
              <CFormInput 
                placeholder={t('common.search') + '..."'} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('common.status')}</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="primary" /></div>
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>{t('discounts.campaigns')}</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Value</CTableHeaderCell>
                  <CTableHeaderCell>Performance</CTableHeaderCell>
                  <CTableHeaderCell>Valid Period</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.status')}</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">{t('common.actions')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredItems.map((campaign) => (
                  <CTableRow key={campaign._id}>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{campaign.name}</div>
                        <small className="text-muted">{campaign.description}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={campaign.type === 'percentage' ? 'info' : campaign.type === 'fixed' ? 'warning' : 'success'}>
                        {campaign.type === 'percentage' ? 'Percentage' : campaign.type === 'fixed' ? 'Fixed Amount' : 'BOGO'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{campaign.type === 'percentage' ? `${campaign.value}%` : `$${campaign.value}`}</div>
                        {campaign.minOrderAmount && (
                          <small className="text-muted">Min: ${campaign.minOrderAmount}</small>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{campaign.stats?.totalOrders || 0} orders</div>
                        <div>${campaign.stats?.totalRevenue || 0} revenue</div>
                        <div className="text-success">${campaign.stats?.totalDiscount || 0} saved</div>
                        <small className="text-muted">{campaign.stats?.conversionRate || 0}% conversion</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>From: {campaign.validFrom ? new Date(campaign.validFrom).toLocaleDateString() : 'N/A'}</div>
                        <div>Until: {campaign.validUntil ? new Date(campaign.validUntil).toLocaleDateString() : 'No expiry'}</div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusColor(campaign)}>
                        {getStatusText(campaign)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CRow className="g-2 justify-content-end">
                        <CCol xs="auto">
                          <CButton size="sm" color="info" variant="outline" onClick={() => openEdit(campaign)}>
                            {t('discounts.edit')}
                          </CButton>
                        </CCol>
                        <CCol xs="auto">
                          <CButton 
                            size="sm" 
                            color={campaign.isActive ? 'warning' : 'success'} 
                            variant="outline" 
                            onClick={() => toggleActive(campaign)}
                          >
                            {campaign.isActive ? 'Deactivate' : 'Activate'}
                          </CButton>
                        </CCol>
                        <CCol xs="auto">
                          <CButton size="sm" color="danger" variant="outline" onClick={() => handleDelete(campaign)}>
                            {t('common.delete')}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Campaign Modal */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>{editing ? t('discounts.edit') : t('discounts.add')} {t('discounts.campaigns')}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={12}>
                <CFormInput 
                  label="Campaign Name" 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required 
                />
              </CCol>
              <CCol md={12}>
                <CFormTextarea 
                  label="Description" 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={2}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect 
                  label="Discount Type" 
                  value={form.type} 
                  onChange={(e) => setForm({...form, type: e.target.value})}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="bogo">Buy One Get One</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Discount Value" 
                  type="number" 
                  step="0.01" 
                  value={form.value} 
                  onChange={(e) => setForm({...form, value: e.target.value})}
                  required 
                  placeholder={form.type === 'percentage' ? '10' : '20'}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Minimum Order Amount" 
                  type="number" 
                  step="0.01" 
                  value={form.minOrderAmount} 
                  onChange={(e) => setForm({...form, minOrderAmount: e.target.value})}
                  placeholder="0"
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Maximum Discount Amount" 
                  type="number" 
                  step="0.01" 
                  value={form.maxDiscountAmount} 
                  onChange={(e) => setForm({...form, maxDiscountAmount: e.target.value})}
                  placeholder="No limit"
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Valid From" 
                  type="date" 
                  value={form.validFrom} 
                  onChange={(e) => setForm({...form, validFrom: e.target.value})}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Valid Until" 
                  type="date" 
                  value={form.validUntil} 
                  onChange={(e) => setForm({...form, validUntil: e.target.value})}
                />
              </CCol>
              <CCol md={12}>
                <div className="border-top pt-3">
                  <h6>Campaign Conditions</h6>
                </div>
              </CCol>
              <CCol md={12}>
                <CFormCheck 
                  id="newCustomersOnly" 
                  label="New Customers Only" 
                  checked={form.conditions.newCustomersOnly} 
                  onChange={(e) => setForm({
                    ...form, 
                    conditions: {...form.conditions, newCustomersOnly: e.target.checked}
                  })}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Minimum Order Quantity" 
                  type="number" 
                  value={form.conditions.minOrderQuantity} 
                  onChange={(e) => setForm({
                    ...form, 
                    conditions: {...form.conditions, minOrderQuantity: e.target.value}
                  })}
                  placeholder="No limit"
                />
              </CCol>
              <CCol md={12}>
                <CFormCheck 
                  id="isActive" 
                  label="Active" 
                  checked={form.isActive} 
                  onChange={(e) => setForm({...form, isActive: e.target.checked})}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </CButton>
            <CButton color="primary" type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default Campaigns
