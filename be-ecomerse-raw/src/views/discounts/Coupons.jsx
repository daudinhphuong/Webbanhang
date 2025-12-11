import React, { useEffect, useState, useContext } from 'react'
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CBadge, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CForm, CFormInput, CFormSelect, CFormTextarea, CAlert,
  CRow, CCol, CFormCheck, CSpinner, CListGroup, CListGroupItem, CInputGroup, CInputGroupText
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const Coupons = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage', // percentage or fixed
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
    applicableTo: 'all', // all, category, product, user
    categoryIds: [],
    productIds: [],
    userIds: []
  })


  const load = async () => {
    setLoading(true)
    try {
      // Load coupons from API
      const res = await axiosClient.get('/coupons/public')
      const data = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : [])
      setItems(data)
      
      // Load related data
      const [catRes, prodRes, userRes] = await Promise.all([
        axiosClient.get('/categories').catch(() => ({ data: [] })),
        axiosClient.get('/product?limit=100').catch(() => ({ data: { contents: [] } })),
        axiosClient.get('/users').catch(() => ({ data: [] }))
      ])
      
      setCategories(Array.isArray(catRes.data) ? catRes.data : [])
      setProducts(Array.isArray(prodRes.data.contents) ? prodRes.data.contents : [])
      setUsers(Array.isArray(userRes.data) ? userRes.data : [])
    } catch (e) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message
      console.error('ADMIN_COUPONS_LOAD_ERROR', status, msg)
      if (status === 401) setError('Vui lòng đăng nhập lại (401)')
      else if (status === 403) setError('Bạn không có quyền admin (403)')
      else setError(`Không tải được danh sách coupon${status ? ` (${status})` : ''}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      usageLimitPerUser: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
      applicableTo: 'all',
      categoryIds: [],
      productIds: [],
      userIds: []
    })
  }

  const openCreate = () => {
    setEditing(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (coupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code || '',
      name: coupon.name || '',
      description: coupon.description || '',
      type: coupon.type || 'percentage',
      value: coupon.value || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      usageLimit: coupon.usageLimit || '',
      usageLimitPerUser: coupon.usageLimitPerUser || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive !== false,
      applicableTo: coupon.applicableTo || 'all',
      categoryIds: coupon.categoryIds || [],
      productIds: coupon.productIds || [],
      userIds: coupon.userIds || []
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
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        usageLimitPerUser: form.usageLimitPerUser ? Number(form.usageLimitPerUser) : null,
        validFrom: form.validFrom ? new Date(form.validFrom) : null,
        validUntil: form.validUntil ? new Date(form.validUntil) : null
      }
      
      if (editing) {
        await axiosClient.put(`/coupons/${editing._id}`, payload)
      } else {
        await axiosClient.post('/coupons', payload)
      }
      
      setModalOpen(false)
      await load()
    } catch (e) {
      console.error('Error saving coupon:', e)
      setError('Failed to save coupon: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (coupon) => {
    if (!window.confirm('Xóa coupon này?')) return
    try {
      await axiosClient.delete(`/coupons/${coupon._id}`)
      await load()
    } catch (e) {
      console.error('Error deleting coupon:', e)
      setError('Failed to delete coupon: ' + (e.response?.data?.message || e.message))
    }
  }

  const toggleActive = async (coupon) => {
    try {
      await axiosClient.patch(`/coupons/${coupon._id}/toggle`)
      await load()
    } catch (e) {
      console.error('Error toggling coupon:', e)
      setError('Failed to toggle coupon status: ' + (e.response?.data?.message || e.message))
    }
  }

  const getStatusColor = (coupon) => {
    const now = new Date()
    if (!coupon.isActive) return 'secondary'
    if (coupon.validUntil && new Date(coupon.validUntil) < now) return 'danger'
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 'warning'
    return 'success'
  }

  const getStatusText = (coupon) => {
    const now = new Date()
    if (!coupon.isActive) return 'Inactive'
    if (coupon.validUntil && new Date(coupon.validUntil) < now) return 'Expired'
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 'Limit Reached'
    return 'Active'
  }

  const filteredItems = items.filter(coupon => {
    const matchesSearch = !searchTerm || 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const status = getStatusText(coupon)
    const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter
    
    const matchesType = typeFilter === 'all' || coupon.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol><strong>{t('discounts.coupons')}</strong></CCol>
            <CCol className="text-end">
              <CButton color="primary" onClick={openCreate}>{t('discounts.add')} {t('discounts.coupons')}</CButton>
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
            <CCol md={2}>
              <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('common.all')} {t('common.status')}</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="limit reached">Limit Reached</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">{t('common.all')} Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
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
                  <CTableHeaderCell>{t('discounts.code')}</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Value</CTableHeaderCell>
                  <CTableHeaderCell>Usage</CTableHeaderCell>
                  <CTableHeaderCell>{t('discounts.validTo')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('common.status')}</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">{t('common.actions')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredItems.map((coupon) => (
                  <CTableRow key={coupon._id}>
                    <CTableDataCell>
                      <div>
                        <div style={{ fontWeight: 500 }}>{coupon.code}</div>
                        <small className="text-muted">{coupon.applicableTo}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{coupon.name}</div>
                        <small className="text-muted">{coupon.description}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={coupon.type === 'percentage' ? 'info' : 'warning'}>
                        {coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}</div>
                        {coupon.minOrderAmount && (
                          <small className="text-muted">Min: ${coupon.minOrderAmount}</small>
                        )}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <div>{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</div>
                        <small className="text-muted">Per user: {coupon.usageLimitPerUser || '∞'}</small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'No expiry'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusColor(coupon)}>
                        {getStatusText(coupon)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CRow className="g-2 justify-content-end">
                        <CCol xs="auto">
                          <CButton size="sm" color="info" variant="outline" onClick={() => openEdit(coupon)}>
                            {t('discounts.edit')}
                          </CButton>
                        </CCol>
                        <CCol xs="auto">
                          <CButton 
                            size="sm" 
                            color={coupon.isActive ? 'warning' : 'success'} 
                            variant="outline" 
                            onClick={() => toggleActive(coupon)}
                          >
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </CButton>
                        </CCol>
                        <CCol xs="auto">
                          <CButton size="sm" color="danger" variant="outline" onClick={() => handleDelete(coupon)}>
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

      {/* Coupon Modal */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>{editing ? t('discounts.edit') : t('discounts.add')} {t('discounts.coupons')}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormInput 
                  label="Coupon Code" 
                  value={form.code} 
                  onChange={(e) => setForm({...form, code: e.target.value})}
                  required 
                  placeholder="e.g., WELCOME10"
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Coupon Name" 
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
                  label="Total Usage Limit" 
                  type="number" 
                  value={form.usageLimit} 
                  onChange={(e) => setForm({...form, usageLimit: e.target.value})}
                  placeholder="No limit"
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Usage Limit Per User" 
                  type="number" 
                  value={form.usageLimitPerUser} 
                  onChange={(e) => setForm({...form, usageLimitPerUser: e.target.value})}
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
                <CFormSelect 
                  label="Applicable To" 
                  value={form.applicableTo} 
                  onChange={(e) => setForm({...form, applicableTo: e.target.value})}
                >
                  <option value="all">All Products</option>
                  <option value="category">Specific Categories</option>
                  <option value="product">Specific Products</option>
                  <option value="user">Specific Users</option>
                </CFormSelect>
              </CCol>
              {form.applicableTo === 'category' && (
                <CCol md={12}>
                  <label className="form-label">Select Categories</label>
                  <div className="d-flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <CFormCheck
                        key={cat._id}
                        id={`cat-${cat._id}`}
                        label={cat.name}
                        checked={form.categoryIds.includes(cat._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({...form, categoryIds: [...form.categoryIds, cat._id]})
                          } else {
                            setForm({...form, categoryIds: form.categoryIds.filter(id => id !== cat._id)})
                          }
                        }}
                      />
                    ))}
                  </div>
                </CCol>
              )}
              {form.applicableTo === 'product' && (
                <CCol md={12}>
                  <label className="form-label">Select Products</label>
                  <div className="d-flex flex-wrap gap-2">
                    {products.slice(0, 10).map(prod => (
                      <CFormCheck
                        key={prod._id}
                        id={`prod-${prod._id}`}
                        label={prod.name}
                        checked={form.productIds.includes(prod._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({...form, productIds: [...form.productIds, prod._id]})
                          } else {
                            setForm({...form, productIds: form.productIds.filter(id => id !== prod._id)})
                          }
                        }}
                      />
                    ))}
                  </div>
                </CCol>
              )}
              {form.applicableTo === 'user' && (
                <CCol md={12}>
                  <label className="form-label">Select Users</label>
                  <div className="d-flex flex-wrap gap-2">
                    {users.slice(0, 10).map(user => (
                      <CFormCheck
                        key={user._id}
                        id={`user-${user._id}`}
                        label={user.name || user.username}
                        checked={form.userIds.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({...form, userIds: [...form.userIds, user._id]})
                          } else {
                            setForm({...form, userIds: form.userIds.filter(id => id !== user._id)})
                          }
                        }}
                      />
                    ))}
                  </div>
                </CCol>
              )}
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

export default Coupons
