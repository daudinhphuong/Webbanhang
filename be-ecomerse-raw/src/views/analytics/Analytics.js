import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CChart,
} from '@coreui/react'
import { cilChartPie } from '@coreui/icons'

const Analytics = () => {
  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Analytics Dashboard</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} className="mb-4">
                  <CCard>
                    <CCardHeader>
                      <strong>Sales Overview</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CChart
                        type="line"
                        data={{
                          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                          datasets: [
                            {
                              label: 'Sales',
                              backgroundColor: 'rgba(220, 220, 220, 0.2)',
                              borderColor: 'rgba(220, 220, 220, 1)',
                              pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                              pointBorderColor: '#fff',
                              data: [40, 20, 12, 39, 10, 40, 39, 80, 40],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol xs={12} md={6} className="mb-4">
                  <CCard>
                    <CCardHeader>
                      <strong>Revenue Distribution</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CChart
                        type="doughnut"
                        data={{
                          labels: ['Online Sales', 'In-store Sales', 'Mobile Sales'],
                          datasets: [
                            {
                              backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                              ],
                              data: [300, 50, 100],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={12}>
                  <CCard>
                    <CCardHeader>
                      <strong>Key Metrics</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CRow>
                        <CCol xs={6} md={3}>
                          <div className="text-center">
                            <h4 className="text-primary">$12,345</h4>
                            <p className="text-muted">Total Revenue</p>
                          </div>
                        </CCol>
                        <CCol xs={6} md={3}>
                          <div className="text-center">
                            <h4 className="text-success">1,234</h4>
                            <p className="text-muted">Total Orders</p>
                          </div>
                        </CCol>
                        <CCol xs={6} md={3}>
                          <div className="text-center">
                            <h4 className="text-info">567</h4>
                            <p className="text-muted">New Customers</p>
                          </div>
                        </CCol>
                        <CCol xs={6} md={3}>
                          <div className="text-center">
                            <h4 className="text-warning">89%</h4>
                            <p className="text-muted">Conversion Rate</p>
                          </div>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Analytics
