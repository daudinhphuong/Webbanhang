import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormTextarea, CFormCheck } from '@coreui/react'
import axiosClient from '../../lib/axiosClient'
import { useLanguage } from '../../contexts/LanguageContext'

const AboutPosts = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', thumbnail: '', published: false })

  const load = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/about-posts')
      setItems(Array.isArray(res.data) ? res.data : [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const openCreate = () => { setEditing(null); setForm({ title: '', content: '', thumbnail: '', published: false }); setModalOpen(true) }
  const openEdit = (p) => { setEditing(p); setForm({ title: p.title||'', content: p.content||'', thumbnail: p.thumbnail||'', published: Boolean(p.publishedAt) }); setModalOpen(true) }

  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    setSaving(true)
    try {
      const payload = { title: form.title, content: form.content, thumbnail: form.thumbnail }
      if (form.published) payload.publishedAt = editing?.publishedAt || new Date().toISOString()
      if (editing && (editing._id||editing.id)) {
        await axiosClient.put(`/about-posts/${editing._id||editing.id}`, payload)
      } else {
        await axiosClient.post('/about-posts', payload)
      }
      setModalOpen(false); await load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    if (!window.confirm('Xóa bài viết này?')) return
    await axiosClient.delete(`/about-posts/${p._id||p.id}`)
    await load()
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>{t('about.title')}</strong>
        <CButton color="primary" onClick={openCreate}>{t('about.add')}</CButton>
      </CCardHeader>
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>{t('about.titleField')}</CTableHeaderCell>
              <CTableHeaderCell>Published</CTableHeaderCell>
              <CTableHeaderCell className="text-end">{t('common.actions')}</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.map((it, idx) => (
              <CTableRow key={it._id||idx}>
                <CTableDataCell>{idx+1}</CTableDataCell>
                <CTableDataCell>{it.title}</CTableDataCell>
                <CTableDataCell>{it.publishedAt ? new Date(it.publishedAt).toLocaleString() : '-'}</CTableDataCell>
                <CTableDataCell className="text-end">
                  <CButton size="sm" color="secondary" variant="outline" onClick={() => openEdit(it)}>{t('about.edit')}</CButton>{' '}
                  <CButton size="sm" color="danger" variant="outline" onClick={() => handleDelete(it)}>{t('about.delete')}</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>

      <CModal visible={modalOpen} onClose={()=>setModalOpen(false)} backdrop="static">
        <CModalHeader><CModalTitle>{editing ? t('about.edit') : t('about.add')}</CModalTitle></CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CFormInput className="mb-3" label={t('about.titleField')} value={form.title} onChange={onChange('title')} required />
            <CFormInput className="mb-3" label="Thumbnail URL" value={form.thumbnail} onChange={onChange('thumbnail')} />
            <CFormTextarea label={t('about.content')} rows={8} value={form.content} onChange={onChange('content')} required />
            <div className="mt-3">
              <CFormCheck id="about-published" label="Published" checked={form.published} onChange={(e)=>setForm((s)=>({ ...s, published: e.target.checked }))} />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={()=>setModalOpen(false)} disabled={saving}>{t('common.cancel')}</CButton>
            <CButton color="primary" type="submit" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CCard>
  )
}

export default AboutPosts


