import mongoose from 'mongoose'

const SettingSchema = new mongoose.Schema({
  shopName: { type: String, default: '' },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  email: { type: String, default: '' }, // Alias for contactEmail
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  workingHours: { type: String, default: 'Thứ 2 - Thứ 6: 8:00 - 18:00' },
  website: { type: String, default: '' },
  timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
  currency: { type: String, default: 'VND' },
  language: { type: String, default: 'vi' },
  maintenanceMode: { type: Boolean, default: false },
  allowRegistration: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: false },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: { type: String, default: '' },
  googleAnalytics: { type: String, default: '' },
  facebookPixel: { type: String, default: '' },
  customCss: { type: String, default: '' },
  customJs: { type: String, default: '' },
  shippingFee: { type: Number, default: 0 },
  paymentOptions: { type: [String], default: [] }, // Legacy: simple array of enabled payment method IDs
  paymentMethods: {
    type: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      enabled: { type: Boolean, default: false },
      fee: { type: Number, default: 0 },
      feeType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      description: { type: String, default: '' },
      icon: { type: String, default: '' },
      color: { type: String, default: 'primary' },
      settings: { type: mongoose.Schema.Types.Mixed, default: {} }
    }],
    default: []
  },
  paymentSettings: {
    defaultPaymentMethod: { type: String, default: 'cod' },
    allowMultiplePayments: { type: Boolean, default: false },
    autoCapture: { type: Boolean, default: true },
    refundPolicy: { type: String, default: '' },
    currency: { type: String, default: 'VND' },
    minimumAmount: { type: Number, default: 10000 },
    maximumAmount: { type: Number, default: 50000000 },
    paymentTimeout: { type: Number, default: 15 },
    requirePaymentConfirmation: { type: Boolean, default: true },
    sendPaymentNotifications: { type: Boolean, default: true },
    allowPartialRefunds: { type: Boolean, default: true },
    autoRefundOnCancel: { type: Boolean, default: false }
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  taxCode: { type: String, default: '' },
  bankInfo: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountHolder: { type: String, default: '' }
  }
}, { timestamps: true })

export default mongoose.model('Setting', SettingSchema)


