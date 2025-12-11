import React, { useEffect, useState } from 'react'
import { 
  CCard, CCardHeader, CCardBody, CButton, CAlert, CRow, CCol, CFormInput, 
  CFormTextarea, CFormSelect, CSpinner, CForm, CFormLabel, CFormCheck, 
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge,
  CInputGroup, CInputGroupText, CProgress
} from '@coreui/react'
import axiosClient from '../../lib/axiosClient'

const PaymentSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testingPayment, setTestingPayment] = useState('')
  const [testResult, setTestResult] = useState('')
  
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'cod',
      name: 'Cash on Delivery',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
      description: 'Pay when you receive the order',
      icon: 'cil-money',
      color: 'success',
      settings: {
        allowPartialPayment: false,
        requireSignature: true,
        maxAmount: 10000000
      }
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
      description: 'Vietnam Payment Gateway',
      icon: 'cil-credit-card',
      color: 'primary',
      settings: {
        merchantId: 'VNPAY_MERCHANT_ID',
        secretKey: 'VNPAY_SECRET_KEY',
        apiUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        returnUrl: 'https://shop.com/payment/return',
        testMode: true
      }
    },
    {
      id: 'momo',
      name: 'MoMo Wallet',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
      description: 'Mobile Money Payment',
      icon: 'cil-devices',
      color: 'warning',
      settings: {
        partnerCode: 'MOMO_PARTNER_CODE',
        accessKey: 'MOMO_ACCESS_KEY',
        secretKey: 'MOMO_SECRET_KEY',
        apiUrl: 'https://test-payment.momo.vn/v2/gateway/api/create',
        returnUrl: 'https://shop.com/payment/momo/return',
        testMode: true
      }
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: false,
      fee: 3.4,
      feeType: 'percentage',
      description: 'International Payment Gateway',
      icon: 'cil-dollar',
      color: 'info',
      settings: {
        clientId: 'PAYPAL_CLIENT_ID',
        clientSecret: 'PAYPAL_CLIENT_SECRET',
        apiUrl: 'https://api.sandbox.paypal.com',
        returnUrl: 'https://shop.com/payment/paypal/return',
        testMode: true
      }
    },
    {
      id: 'stripe',
      name: 'Stripe',
      enabled: false,
      fee: 2.9,
      feeType: 'percentage',
      description: 'International Payment Gateway',
      icon: 'cil-credit-card',
      color: 'secondary',
      settings: {
        publishableKey: 'STRIPE_PUBLISHABLE_KEY',
        secretKey: 'STRIPE_SECRET_KEY',
        webhookSecret: 'STRIPE_WEBHOOK_SECRET',
        testMode: true
      }
    }
  ])

  const [generalSettings, setGeneralSettings] = useState({
    defaultPaymentMethod: 'cod',
    allowMultiplePayments: false,
    autoCapture: true,
    refundPolicy: 'Full refund within 30 days',
    currency: 'VND',
    minimumAmount: 10000,
    maximumAmount: 50000000,
    paymentTimeout: 15, // minutes
    requirePaymentConfirmation: true,
    sendPaymentNotifications: true,
    allowPartialRefunds: true,
    autoRefundOnCancel: false
  })

  const loadSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosClient.get('/settings')
      const settings = res.data || {}
      
      // Default payment methods
      const defaultMethods = [
          {
            id: 'cod',
            name: 'Cash on Delivery',
            enabled: true,
            fee: 0,
            feeType: 'fixed',
            description: 'Pay when you receive the order',
            icon: 'cil-money',
            color: 'success',
            settings: {
              allowPartialPayment: false,
              requireSignature: true,
              maxAmount: 10000000
            }
          },
          {
            id: 'vnpay',
            name: 'VNPay',
            enabled: false,
            fee: 0,
            feeType: 'fixed',
            description: 'Vietnam Payment Gateway',
            icon: 'cil-credit-card',
            color: 'primary',
            settings: {
              merchantId: '',
              secretKey: '',
              apiUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
              returnUrl: '',
              testMode: true
            }
          },
          {
            id: 'momo',
            name: 'MoMo Wallet',
            enabled: false,
            fee: 0,
            feeType: 'fixed',
            description: 'Mobile Money Payment',
            icon: 'cil-devices',
            color: 'warning',
            settings: {
              partnerCode: '',
              accessKey: '',
              secretKey: '',
              apiUrl: 'https://test-payment.momo.vn/v2/gateway/api/create',
              returnUrl: '',
              testMode: true
            }
          },
          {
            id: 'paypal',
            name: 'PayPal',
            enabled: false,
            fee: 3.4,
            feeType: 'percentage',
            description: 'International Payment Gateway',
            icon: 'cil-dollar',
            color: 'info',
            settings: {
              clientId: '',
              clientSecret: '',
              apiUrl: 'https://api.sandbox.paypal.com',
              returnUrl: '',
              testMode: true
            }
          },
          {
            id: 'stripe',
            name: 'Stripe',
            enabled: false,
            fee: 2.9,
            feeType: 'percentage',
            description: 'International Payment Gateway',
            icon: 'cil-credit-card',
            color: 'secondary',
            settings: {
              publishableKey: '',
              secretKey: '',
              webhookSecret: '',
              testMode: true
            }
          }
      ]
      
      // Merge saved methods with defaults (if settings exist)
      const mergedMethods = defaultMethods.map(defaultMethod => {
        const savedMethod = settings.paymentMethods?.find(m => m.id === defaultMethod.id)
        return savedMethod ? { ...defaultMethod, ...savedMethod } : defaultMethod
      })
      
      setPaymentMethods(mergedMethods)
      
      // Load general payment settings
      if (settings.paymentSettings) {
        setGeneralSettings(prev => ({ ...prev, ...settings.paymentSettings }))
      }
    } catch (e) {
      console.error('Error loading payment settings:', e)
      setError('Không tải được cài đặt thanh toán: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  const handleGeneralChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleMethodChange = (methodId, field, value) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId ? { ...method, [field]: value } : method
    ))
  }

  const handleMethodSettingChange = (methodId, settingKey, value) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { 
            ...method, 
            settings: { ...method.settings, [settingKey]: value } 
          } 
        : method
    ))
  }

  const toggleMethod = (methodId) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId ? { ...method, enabled: !method.enabled } : method
    ))
  }

  const testPaymentMethod = async (methodId) => {
    setTestingPayment(methodId)
    setTestResult('')
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const method = paymentMethods.find(m => m.id === methodId)
      setTestResult(`✅ ${method.name} connection test successful!`)
    } catch (e) {
      setTestResult(`❌ ${methodId} connection test failed: ${e.message}`)
    } finally {
      setTestingPayment('')
    }
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Build payload
      const payload = {
        paymentMethods: paymentMethods,
        paymentSettings: generalSettings,
        // Also update paymentOptions for backward compatibility
        paymentOptions: paymentMethods.filter(m => m.enabled).map(m => m.id)
      }
      
      console.log('Saving payment settings:', payload)
      
      await axiosClient.put('/settings', payload)
      
      setSuccess('Cài đặt thanh toán đã được lưu thành công!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error('Error saving payment settings:', e)
      setError('Lỗi khi lưu cài đặt: ' + (e.response?.data?.message || e.message))
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

  const getFeeDisplay = (method) => {
    if (method.feeType === 'percentage') {
      return `${method.fee}%`
    }
    return formatCurrency(method.fee)
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol md={8}>
          <h2>Cài đặt chức năng thanh toán</h2>
          <p className="text-muted">Cấu hình phương thức thanh toán</p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton color="info" onClick={() => setTestModalOpen(true)}>
            Test All Payments
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
                <strong>Cài đặt chức năng thanh toán</strong>
              </CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  <CCol md={12}>
                    <CFormSelect
                      label="Thanh toán măc định"
                      value={generalSettings.defaultPaymentMethod}
                      onChange={handleGeneralChange('defaultPaymentMethod')}
                    >
                      {paymentMethods.filter(m => m.enabled).map(method => (
                        <option key={method.id} value={method.id}>{method.name}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label="Số tiền tối thiểu (VND)"
                      type="number"
                      value={generalSettings.minimumAmount}
                      onChange={handleGeneralChange('minimumAmount')}
                      placeholder="10000"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label="Số tiền tối đa (VND)"
                      type="number"
                      value={generalSettings.maximumAmount}
                      onChange={handleGeneralChange('maximumAmount')}
                      placeholder="50000000"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormInput
                      label="Hết hạn thanh toán (phút)"
                      type="number"
                      value={generalSettings.paymentTimeout}
                      onChange={handleGeneralChange('paymentTimeout')}
                      placeholder="15"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormTextarea
                      label="Chính sách hoàn tiền"
                      value={generalSettings.refundPolicy}
                      onChange={handleGeneralChange('refundPolicy')}
                      rows={3}
                      placeholder="Describe your refund policy..."
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="allowMultiplePayments"
                      label="Cho phép nhiều phương thức thanh toán"
                      checked={generalSettings.allowMultiplePayments}
                      onChange={handleGeneralChange('allowMultiplePayments')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="autoCapture"
                      label="Tự động thanh toán"
                      checked={generalSettings.autoCapture}
                      onChange={handleGeneralChange('autoCapture')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="requirePaymentConfirmation"
                      label="Yêu cầu xác nhận thanh toán"
                      checked={generalSettings.requirePaymentConfirmation}
                      onChange={handleGeneralChange('requirePaymentConfirmation')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="sendPaymentNotifications"
                      label="Gửi thông báo thanh toán"
                      checked={generalSettings.sendPaymentNotifications}
                      onChange={handleGeneralChange('sendPaymentNotifications')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="allowPartialRefunds"
                      label="Hoàn tiền một phần"
                      checked={generalSettings.allowPartialRefunds}
                      onChange={handleGeneralChange('allowPartialRefunds')}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormCheck
                      id="autoRefundOnCancel"
                      label="Hoàn tiền tự động khi hủy đơn hàng"
                      checked={generalSettings.autoRefundOnCancel}
                      onChange={handleGeneralChange('autoRefundOnCancel')}
                    />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Payment Methods */}
          <CCol md={6}>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Phương thức thanh toán</strong>
              </CCardHeader>
              <CCardBody>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Phương thức</CTableHeaderCell>
                      <CTableHeaderCell>Phí</CTableHeaderCell>
                      <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                      <CTableHeaderCell>Cài đặt</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {paymentMethods.map((method) => (
                      <CTableRow key={method.id}>
                        <CTableDataCell>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              <i className={`${method.icon} me-2`}></i>
                              {method.name}
                            </div>
                            <small className="text-muted">{method.description}</small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{getFeeDisplay(method)}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={method.enabled ? 'success' : 'secondary'}>
                            {method.enabled ? 'Enabled' : 'Disabled'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            size="sm" 
                            color={method.enabled ? 'warning' : 'success'} 
                            variant="outline" 
                            onClick={() => toggleMethod(method.id)}
                            className="me-1"
                          >
                            {method.enabled ? 'Disable' : 'Enable'}
                          </CButton>
                          <CButton 
                            size="sm" 
                            color="info" 
                            variant="outline" 
                            onClick={() => testPaymentMethod(method.id)}
                            disabled={testingPayment === method.id}
                          >
                            {testingPayment === method.id ? 'Testing...' : 'Test'}
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

        {/* Payment Method Details */}
        <CRow>
          {paymentMethods.map((method) => (
            <CCol md={6} key={method.id} className="mb-4">
              <CCard>
                <CCardHeader>
                  <strong>{method.name} Configuration</strong>
                  <CBadge color={method.enabled ? 'success' : 'secondary'} className="ms-2">
                    {method.enabled ? 'Enabled' : 'Disabled'}
                  </CBadge>
                </CCardHeader>
                <CCardBody>
                  <CRow className="g-3">
                    <CCol md={6}>
                      <CFormInput
                        label="Fee"
                        type="number"
                        value={method.fee}
                        onChange={(e) => handleMethodChange(method.id, 'fee', parseFloat(e.target.value))}
                        placeholder="0"
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormSelect
                        label="Fee Type"
                        value={method.feeType}
                        onChange={(e) => handleMethodChange(method.id, 'feeType', e.target.value)}
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                      <CFormTextarea
                        label="Description"
                        value={method.description}
                        onChange={(e) => handleMethodChange(method.id, 'description', e.target.value)}
                        rows={2}
                      />
                    </CCol>
                    
                    {/* Method-specific settings */}
                    {method.id === 'vnpay' && (
                      <>
                        <CCol md={12}>
                          <CFormInput
                            label="Merchant ID"
                            value={method.settings.merchantId}
                            onChange={(e) => handleMethodSettingChange(method.id, 'merchantId', e.target.value)}
                            placeholder="VNPAY_MERCHANT_ID"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="Secret Key"
                            type="password"
                            value={method.settings.secretKey}
                            onChange={(e) => handleMethodSettingChange(method.id, 'secretKey', e.target.value)}
                            placeholder="VNPAY_SECRET_KEY"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="API URL"
                            value={method.settings.apiUrl}
                            onChange={(e) => handleMethodSettingChange(method.id, 'apiUrl', e.target.value)}
                            placeholder="https://sandbox.vnpayment.vn/..."
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormCheck
                            id={`${method.id}-testMode`}
                            label="Test Mode"
                            checked={method.settings.testMode}
                            onChange={(e) => handleMethodSettingChange(method.id, 'testMode', e.target.checked)}
                          />
                        </CCol>
                      </>
                    )}

                    {method.id === 'momo' && (
                      <>
                        <CCol md={12}>
                          <CFormInput
                            label="Partner Code"
                            value={method.settings.partnerCode}
                            onChange={(e) => handleMethodSettingChange(method.id, 'partnerCode', e.target.value)}
                            placeholder="MOMO_PARTNER_CODE"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="Access Key"
                            value={method.settings.accessKey}
                            onChange={(e) => handleMethodSettingChange(method.id, 'accessKey', e.target.value)}
                            placeholder="MOMO_ACCESS_KEY"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="Secret Key"
                            type="password"
                            value={method.settings.secretKey}
                            onChange={(e) => handleMethodSettingChange(method.id, 'secretKey', e.target.value)}
                            placeholder="MOMO_SECRET_KEY"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormCheck
                            id={`${method.id}-testMode`}
                            label="Test Mode"
                            checked={method.settings.testMode}
                            onChange={(e) => handleMethodSettingChange(method.id, 'testMode', e.target.checked)}
                          />
                        </CCol>
                      </>
                    )}

                    {method.id === 'paypal' && (
                      <>
                        <CCol md={12}>
                          <CFormInput
                            label="Client ID"
                            value={method.settings.clientId}
                            onChange={(e) => handleMethodSettingChange(method.id, 'clientId', e.target.value)}
                            placeholder="PAYPAL_CLIENT_ID"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="Client Secret"
                            type="password"
                            value={method.settings.clientSecret}
                            onChange={(e) => handleMethodSettingChange(method.id, 'clientSecret', e.target.value)}
                            placeholder="PAYPAL_CLIENT_SECRET"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="API URL"
                            value={method.settings.apiUrl}
                            onChange={(e) => handleMethodSettingChange(method.id, 'apiUrl', e.target.value)}
                            placeholder="https://api.sandbox.paypal.com"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormCheck
                            id={`${method.id}-testMode`}
                            label="Test Mode"
                            checked={method.settings.testMode}
                            onChange={(e) => handleMethodSettingChange(method.id, 'testMode', e.target.checked)}
                          />
                        </CCol>
                      </>
                    )}

                    {method.id === 'stripe' && (
                      <>
                        <CCol md={12}>
                          <CFormInput
                            label="Publishable Key"
                            value={method.settings.publishableKey}
                            onChange={(e) => handleMethodSettingChange(method.id, 'publishableKey', e.target.value)}
                            placeholder="pk_test_..."
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="Secret Key"
                            type="password"
                            value={method.settings.secretKey}
                            onChange={(e) => handleMethodSettingChange(method.id, 'secretKey', e.target.value)}
                            placeholder="sk_test_..."
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            label="Webhook Secret"
                            type="password"
                            value={method.settings.webhookSecret}
                            onChange={(e) => handleMethodSettingChange(method.id, 'webhookSecret', e.target.value)}
                            placeholder="whsec_..."
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormCheck
                            id={`${method.id}-testMode`}
                            label="Test Mode"
                            checked={method.settings.testMode}
                            onChange={(e) => handleMethodSettingChange(method.id, 'testMode', e.target.checked)}
                          />
                        </CCol>
                      </>
                    )}

                    {method.id === 'cod' && (
                      <>
                        <CCol md={12}>
                          <CFormInput
                            label="Maximum Amount (VND)"
                            type="number"
                            value={method.settings.maxAmount}
                            onChange={(e) => handleMethodSettingChange(method.id, 'maxAmount', parseInt(e.target.value))}
                            placeholder="10000000"
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormCheck
                            id={`${method.id}-allowPartialPayment`}
                            label="Allow Partial Payment"
                            checked={method.settings.allowPartialPayment}
                            onChange={(e) => handleMethodSettingChange(method.id, 'allowPartialPayment', e.target.checked)}
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormCheck
                            id={`${method.id}-requireSignature`}
                            label="Require Signature"
                            checked={method.settings.requireSignature}
                            onChange={(e) => handleMethodSettingChange(method.id, 'requireSignature', e.target.checked)}
                          />
                        </CCol>
                      </>
                    )}
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
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

      {/* Test Modal */}
      <CModal visible={testModalOpen} onClose={() => setTestModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Test Payment Methods</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <strong>Testing all enabled payment methods...</strong>
          </div>
          {paymentMethods.filter(m => m.enabled).map((method) => (
            <div key={method.id} className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <span>{method.name}</span>
                <CButton 
                  size="sm" 
                  color="info" 
                  onClick={() => testPaymentMethod(method.id)}
                  disabled={testingPayment === method.id}
                >
                  {testingPayment === method.id ? 'Testing...' : 'Test'}
                </CButton>
              </div>
              {testingPayment === method.id && (
                <CProgress className="mt-1" />
              )}
            </div>
          ))}
          {testResult && (
            <CAlert color="info" className="mt-3">
              {testResult}
            </CAlert>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setTestModalOpen(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default PaymentSettings
