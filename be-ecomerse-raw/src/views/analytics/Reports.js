import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CFormSelect,
  CInputGroup,
  CFormInput,
} from '@coreui/react'

const Reports = () => {
  // Sample data for reports
  const reportData = [
    {
      id: 1,
      name: 'Sales Report',
      type: 'Sales',
      date: '2024-01-15',
      status: 'Completed',
      downloads: 45,
    },
    {
      id: 2,
      name: 'Customer Analytics',
      type: 'Customer',
      date: '2024-01-14',
      status: 'Completed',
      downloads: 23,
    },
    {
      id: 3,
      name: 'Product Performance',
      type: 'Product',
      date: '2024-01-13',
      status: 'Completed',
      downloads: 67,
    },
    {
      id: 4,
      name: 'Revenue Analysis',
      type: 'Revenue',
      date: '2024-01-12',
      status: 'Processing',
      downloads: 0,
    },
    {
      id: 5,
      name: 'Inventory Report',
      type: 'Inventory',
      date: '2024-01-11',
      status: 'Completed',
      downloads: 34,
    },
  ]

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Reports Management</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol xs={12} md={6}>
                  <CInputGroup>
                    <CFormInput placeholder="Search reports..." />
                    <CButton type="button" color="secondary" variant="outline">
                      Search
                    </CButton>
                  </CInputGroup>
                </CCol>
                <CCol xs={12} md={3}>
                  <CFormSelect>
                    <option>All Types</option>
                    <option>Sales</option>
                    <option>Customer</option>
                    <option>Product</option>
                    <option>Revenue</option>
                    <option>Inventory</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} md={3}>
                  <CButton color="primary" className="w-100">
                    Generate New Report
                  </CButton>
                </CCol>
              </CRow>

              <CTable responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Report Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Date Generated</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Downloads</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {reportData.map((report) => (
                    <CTableRow key={report.id}>
                      <CTableDataCell>{report.name}</CTableDataCell>
                      <CTableDataCell>
                        <span className="badge bg-secondary">{report.type}</span>
                      </CTableDataCell>
                      <CTableDataCell>{report.date}</CTableDataCell>
                      <CTableDataCell>
                        <span
                          className={`badge ${
                            report.status === 'Completed'
                              ? 'bg-success'
                              : 'bg-warning'
                          }`}
                        >
                          {report.status}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>{report.downloads}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          className="me-2"
                        >
                          Download
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
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
        <CCol xs={12} md={6}>
          <CCard>
            <CCardHeader>
              <strong>Quick Stats</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={6}>
                  <div className="text-center">
                    <h4 className="text-primary">5</h4>
                    <p className="text-muted">Total Reports</p>
                  </div>
                </CCol>
                <CCol xs={6}>
                  <div className="text-center">
                    <h4 className="text-success">169</h4>
                    <p className="text-muted">Total Downloads</p>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={6}>
          <CCard>
            <CCardHeader>
              <strong>Recent Activity</strong>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Sales Report generated</span>
                <small className="text-muted">2 hours ago</small>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Customer Analytics downloaded</span>
                <small className="text-muted">5 hours ago</small>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Product Performance completed</span>
                <small className="text-muted">1 day ago</small>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Reports
