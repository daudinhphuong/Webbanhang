import React, { useEffect, useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CButton,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CFormSelect,
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

const ProductsList = () => {
  const { t } = useLanguage()
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null) // product or null
  const [form, setForm] = useState({ name: '', price: '', description: '', type: '', material: '', images: '' })
  const [selectedSizes, setSelectedSizes] = useState([])
  const [sizeStocks, setSizeStocks] = useState({}) // { S: 0, M: 0, ... }
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [visible, setVisible] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedStyles, setSelectedStyles] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])

  useEffect(() => {
    console.log('ProductsList - Auth check:', { isAuthenticated, isAdmin, user })
    if (isAuthenticated && isAdmin) {
      const fetchData = async () => {
        try {
          const res = await axiosClient.get('/product', { params: { page: 1, limit: 50, sortType: '3' } })
          const data = res?.data?.contents || res?.data?.data || res?.data || []
          setItems(Array.isArray(data) ? data : (Array.isArray(res?.data?.contents) ? res.data.contents : []))
        } catch (e) {
          setError('Không tải được danh sách sản phẩm')
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    } else {
      setLoading(false)
      setError('Please login as admin to access this page.')
    }
  }, [isAuthenticated, isAdmin, user])

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          axiosClient.get('/categories'),
          axiosClient.get('/brands')
        ])
        setCategories(Array.isArray(cRes.data) ? cRes.data : [])
        setBrands(Array.isArray(bRes.data) ? bRes.data : [])
      } catch (e) {
        // ignore
      }
    }
    loadCatalog()
  }, [])

  const resetForm = () => {
    setForm({ name: '', price: '', description: '', type: '', material: '', images: '' })
    setSelectedSizes([])
    setSizeStocks({})
    setCategoryId('')
    setBrandId('')
    setVisible(true)
    setSelectedColors([])
    setSelectedStyles([])
    setUploadedImages([])
  }
  const openCreate = () => { setEditing(null); resetForm(); setModalOpen(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name || '',
      price: p.price != null ? String(p.price) : '',
      description: p.description || '',
      type: p.type || '',
      material: p.material || '',
      images: Array.isArray(p.images) ? p.images.join(', ') : (p.images || ''),
    })
    const sizesFromProduct = Array.isArray(p.size)
      ? p.size.map((it) => (typeof it === 'string' ? it : (it?.name || it?.label))).filter(Boolean)
      : []
    setSelectedSizes(sizesFromProduct)
    const stocksFromProduct = Array.isArray(p.size)
      ? p.size.reduce((acc, it) => {
        const label = typeof it === 'string' ? it : (it?.name || it?.label)
        const stock = typeof it === 'object' && it?.stock != null ? Number(it.stock) : 0
        if (label) acc[label] = stock
        return acc
      }, {})
      : {}
    setSizeStocks(stocksFromProduct)
    setCategoryId((p.category && (p.category._id || p.category.id)) || p.categoryId || '')
    setBrandId((p.brand && (p.brand._id || p.brand.id)) || p.brandId || '')
    setVisible(typeof p.visible === 'boolean' ? p.visible : true)
    setModalOpen(true)
  }

  const reload = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/product', { params: { page: 1, limit: 50, sortType: '3' } })
      const data = res?.data?.contents || []
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError('Không tải được danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const onChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }))
  const onToggleSize = (label) => (e) => {
    const checked = e.target.checked
    setSelectedSizes((prev) => {
      if (checked) return Array.from(new Set([...prev, label]))
      return prev.filter((x) => x !== label)
    })
    if (!checked) {
      setSizeStocks((prev) => {
        const next = { ...prev }
        delete next[label]
        return next
      })
    }
  }
  const onChangeStock = (label) => (e) => {
    const value = e.target.value
    setSizeStocks((prev) => ({ ...prev, [label]: value }))
  }

  const payload = useMemo(() => {
    const imagesArr = typeof form.images === 'string' && form.images.trim().length > 0
      ? form.images.split(',').map((s) => s.trim()).filter(Boolean)
      : uploadedImages.length > 0 ? uploadedImages : []
    const priceNum = form.price === '' ? undefined : Number(form.price)
    return {
      name: form.name,
      price: priceNum,
      description: form.description,
      type: form.type,
      size: selectedSizes.map((s) => ({ name: s, stock: Number(sizeStocks[s] || 0) })),
      material: form.material,
      images: imagesArr,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      visible,
      colors: selectedColors,
      styles: selectedStyles,
    }
  }, [form, selectedSizes, sizeStocks, categoryId, brandId, visible, selectedColors, selectedStyles, uploadedImages])

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setSaving(true)
    try {
      if (editing && (editing._id || editing.id)) {
        const id = editing._id || editing.id
        await axiosClient.put(`/product/${id}`, payload)
      } else {
        await axiosClient.post('/product', payload)
      }
      setModalOpen(false)
      await reload()
    } catch (e2) {
      setError('Lưu sản phẩm thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!window.confirm('Xóa sản phẩm này?')) return
    try {
      const id = p._id || p.id
      await axiosClient.delete(`/product/${id}`)
      await reload()
    } catch (e) {
      setError('Xóa sản phẩm thất bại')
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'visible' && item.visible !== false) ||
      (statusFilter === 'hidden' && item.visible === false)
    return matchesSearch && matchesStatus
  })

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CRow className="align-items-center">
          <CCol><strong>{t('products.title')}</strong></CCol>
          <CCol className="text-end">
            <CButton color="primary" onClick={openCreate}>{t('products.add')}</CButton>
          </CCol>
        </CRow>
        <CRow className="mt-3">
          <CCol md={6}>
            <CFormInput
              placeholder={t('common.search') + '..."'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCol>
          <CCol md={3}>
            <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t('common.all')} {t('products.title')}</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </CFormSelect>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center py-5"><CSpinner color="primary" /></div>
        ) : error ? (
          <div className="text-danger mb-3">{error}</div>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('products.name')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('products.price')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('products.stock')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('common.status')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('products.category')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('products.brand')}</CTableHeaderCell>
                <CTableHeaderCell scope="col" className="text-end">{t('common.actions')}</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredItems.map((p, idx) => (
                <CTableRow key={p._id || idx}>
                  <CTableHeaderCell scope="row">{idx + 1}</CTableHeaderCell>
                  <CTableDataCell>
                    <div className="d-flex align-items-center">
                      {p.images && p.images.length > 0 && (
                        <img src={p.images[0]} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 8 }} />
                      )}
                      <div>
                        <div>{p.name || p.title || '-'}</div>
                        {p.type && <small className="text-muted">SKU: {p.type}</small>}
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>${p.price != null ? p.price : '-'}</CTableDataCell>
                  <CTableDataCell>{Array.isArray(p.size) ? p.size.reduce((sum, it) => sum + (Number(it?.stock || 0)), 0) : (p.stock != null ? p.stock : (p.quantity ?? '-'))}</CTableDataCell>
                  <CTableDataCell>
                    <span className={`badge ${p.visible !== false ? 'bg-success' : 'bg-secondary'}`}>
                      {p.visible !== false ? 'Visible' : 'Hidden'}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    {p.category?.name || p.categoryId || '-'}
                  </CTableDataCell>
                  <CTableDataCell>
                    {p.brand?.name || p.brandId || '-'}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CButton color="secondary" size="sm" variant="outline" onClick={() => openEdit(p)}>
                      {t('products.edit')}
                    </CButton>
                    {' '}
                    <CButton color="danger" size="sm" variant="outline" onClick={() => handleDelete(p)}>
                      {t('products.delete')}
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editing ? t('products.edit') : t('products.add')}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormInput label={t('products.name')} value={form.name} onChange={onChange('name')} required />
              </CCol>
              <CCol md={6}>
                <CFormInput type="number" step="0.01" label={t('products.price')} value={form.price} onChange={onChange('price')} />
              </CCol>
              <CCol md={12}>
                <CFormTextarea label="Description" value={form.description} onChange={onChange('description')} rows={3} />
              </CCol>
              <CCol md={4}>
                <CFormInput label="SKU" value={form.type} onChange={onChange('type')} />
              </CCol>
              <CCol md={8}>
                <div style={{ marginBottom: 6, fontSize: 12, color: '#6c757d' }}>Sizes</div>
                <div className="d-flex flex-wrap gap-4">
                  {['S', 'M', 'L', 'XL', '41', '42', '43'].map((label) => (
                    <div key={label} className="d-flex align-items-center gap-2">
                      <CFormCheck
                        id={`size-${label}`}
                        label={label}
                        checked={selectedSizes.includes(label)}
                        onChange={onToggleSize(label)}
                      />
                      <CFormInput
                        type="number"
                        min={0}
                        step={1}
                        placeholder="stock"
                        value={sizeStocks[label] ?? ''}
                        onChange={onChangeStock(label)}
                        style={{ width: 100 }}
                        disabled={!selectedSizes.includes(label)}
                      />
                    </div>
                  ))}
                </div>
              </CCol>
              <CCol md={4}>
                <CFormInput label="Material" value={form.material} onChange={onChange('material')} />
              </CCol>
              <CCol md={6}>
                <CFormSelect label={t('products.category')} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">-- {t('common.select')} {t('products.category')} --</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormSelect label={t('products.brand')} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                  <option value="">-- {t('common.select')} {t('products.brand')} --</option>
                  {brands.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormInput label="Images (comma separated URLs)" value={form.images} onChange={onChange('images')} />
                <small className="text-muted">Or upload images below</small>
              </CCol>
              <CCol md={6}>
                <div style={{ marginBottom: 6, fontSize: 12, color: '#6c757d' }}>Colors</div>
                <div className="d-flex flex-wrap gap-2">
                  {['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Pink'].map((color) => (
                    <CFormCheck
                      key={color}
                      id={`color-${color}`}
                      label={color}
                      checked={selectedColors.includes(color)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColors(prev => [...prev, color])
                        } else {
                          setSelectedColors(prev => prev.filter(c => c !== color))
                        }
                      }}
                    />
                  ))}
                </div>
              </CCol>
              <CCol md={6}>
                <div style={{ marginBottom: 6, fontSize: 12, color: '#6c757d' }}>Styles</div>
                <div className="d-flex flex-wrap gap-2">
                  {['Casual', 'Formal', 'Sport', 'Vintage', 'Modern', 'Classic'].map((style) => (
                    <CFormCheck
                      key={style}
                      id={`style-${style}`}
                      label={style}
                      checked={selectedStyles.includes(style)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStyles(prev => [...prev, style])
                        } else {
                          setSelectedStyles(prev => prev.filter(s => s !== style))
                        }
                      }}
                    />
                  ))}
                </div>
              </CCol>
              <CCol md={12}>
                <CFormCheck id="visible" label="Visible on Frontend" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>{t('common.cancel')}</CButton>
            <CButton color="primary" type="submit" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CCard>
  )
}

export default ProductsList


