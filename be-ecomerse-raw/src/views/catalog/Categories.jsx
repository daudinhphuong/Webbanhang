import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, 
  CTableBody, CTableDataCell, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, 
  CForm, CFormInput, CFormSelect, CFormTextarea, CBadge, CSpinner, CRow, CCol 
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const Categories = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '' })
  const [searchTerm, setSearchTerm] = useState('')

  const load = async () => {
    setLoading(true)
    try { 
      const res = await axiosClient.get('/categories')
      const data = Array.isArray(res.data) ? res.data : []
      setItems(data)
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { load() }, [])

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const openCreate = () => { 
    setEditing(null)
    setForm({ name: '', slug: '', description: '', parentId: '' })
    setModalOpen(true) 
  }

  const openEdit = (c) => { 
    setEditing(c)
    setForm({ 
      name: c.name || '', 
      slug: c.slug || '', 
      description: c.description || '',
      parentId: c.parentId || ''
    })
    setModalOpen(true) 
  }

  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        parentId: form.parentId || null
      }
      if (editing && (editing._id || editing.id)) {
        await axiosClient.put(`/categories/${editing._id || editing.id}`, payload)
      } else {
        await axiosClient.post('/categories', payload)
      }
      setModalOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c) => {
    if (!window.confirm('Xóa danh mục này?')) return
    try {
      await axiosClient.delete(`/categories/${c._id || c.id}`)
      await load()
    } catch (e) {
      alert('Không thể xóa danh mục có danh mục con')
    }
  }

  const getCategoryName = (id) => {
    if (!id) return 'Root'
    const category = items.find(c => c._id === id || c.id === id)
    return category ? category.name : 'Unknown'
  }

  const getCategoryLevel = (category) => {
    let level = 0
    let current = category
    while (current && current.parentId) {
      level++
      current = items.find(c => c._id === current.parentId || c.id === current.parentId)
    }
    return level
  }

  const filteredItems = items.filter(item => 
    !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CCard>
      <CCardHeader>
        <CRow className="align-items-center">
          <CCol><strong>{t('catalog.categories')}</strong></CCol>
          <CCol className="text-end">
            <CButton color="primary" onClick={openCreate}>{t('catalog.add')} {t('catalog.categories')}</CButton>
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
        </CRow>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center py-5"><CSpinner color="primary" /></div>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>{t('catalog.name')}</CTableHeaderCell>
                <CTableHeaderCell>Slug</CTableHeaderCell>
                <CTableHeaderCell>Parent</CTableHeaderCell>
                <CTableHeaderCell>Level</CTableHeaderCell>
                <CTableHeaderCell>{t('catalog.description')}</CTableHeaderCell>
                <CTableHeaderCell className="text-end">{t('common.actions')}</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredItems.map((item) => {
                const level = getCategoryLevel(item)
                return (
                  <CTableRow key={item._id || item.id}>
                    <CTableDataCell>
                      <div style={{ paddingLeft: level * 20 }}>
                        {level > 0 && '└─ '}
                        {item.name}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>{item.slug}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={item.parentId ? 'info' : 'success'}>
                        {getCategoryName(item.parentId)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={level === 0 ? 'primary' : level === 1 ? 'secondary' : 'warning'}>
                        Level {level}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.description ? (
                        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      ) : '-'}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton size="sm" color="secondary" variant="outline" onClick={() => openEdit(item)}>
                        {t('catalog.edit')}
                      </CButton>
                      {' '}
                      <CButton size="sm" color="danger" variant="outline" onClick={() => handleDelete(item)}>
                        {t('catalog.delete')}
                      </CButton>
                    </CTableDataCell>
                </CTableRow>
              )
              })}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editing ? t('catalog.edit') : t('catalog.add')} {t('catalog.categories')}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormInput 
                  label={t('catalog.name')} 
                  value={form.name} 
                  onChange={onChange('name')} 
                  required 
                />
              </CCol>
              <CCol md={6}>
                <CFormInput 
                  label="Slug" 
                  value={form.slug} 
                  onChange={onChange('slug')} 
                  required 
                />
              </CCol>
              <CCol md={12}>
                <CFormSelect 
                  label="Parent Category" 
                  value={form.parentId} 
                  onChange={onChange('parentId')}
                >
                  <option value="">Root Category</option>
                  {items
                    .filter(c => !editing || c._id !== editing._id) // Prevent self-parent
                    .map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormTextarea 
                  label={t('catalog.description')} 
                  value={form.description} 
                  onChange={onChange('description')} 
                  rows={3}
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
    </CCard>
  )
}

export default Categories