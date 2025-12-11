import React, { useState } from 'react'
import { createOrder } from '@/apis/orderService'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

const Checkout = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', country: 'Vietnam', street: '', apartment: '', cities: '', state: '', phone: '', zipCode: '', email: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onChange = (k) => (e) => setForm((s)=>({ ...s, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await createOrder({ ...form, paymentMethod })
      const order = res?.data?.data
      if (!order?._id) throw new Error('Order failed')
      if (paymentMethod === 'COD') {
        navigate(`/order?id=${order._id}&totalAmount=${order.totalPrice ?? order.totalAmount ?? 0}&cod=1`)
      } else {
        navigate(`/order?id=${order._id}&totalAmount=${order.totalPrice ?? order.totalAmount ?? 0}`)
      }
    } catch (err) {
      // handle error UI
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-md-6"><label>First name</label><input className="form-control" value={form.firstName} onChange={onChange('firstName')} required /></div>
          <div className="col-md-6"><label>Last name</label><input className="form-control" value={form.lastName} onChange={onChange('lastName')} required /></div>
          <div className="col-md-6"><label>Phone</label><input className="form-control" value={form.phone} onChange={onChange('phone')} required /></div>
          <div className="col-md-6"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={onChange('email')} required /></div>
          <div className="col-md-12"><label>Street</label><input className="form-control" value={form.street} onChange={onChange('street')} required /></div>
          <div className="col-md-6"><label>City</label><input className="form-control" value={form.cities} onChange={onChange('cities')} required /></div>
          <div className="col-md-6"><label>State</label><input className="form-control" value={form.state} onChange={onChange('state')} required /></div>
          <div className="col-md-6"><label>Zip Code</label><input className="form-control" value={form.zipCode} onChange={onChange('zipCode')} required /></div>
          <div className="col-md-6"><label>Country</label><input className="form-control" value={form.country} onChange={onChange('country')} required /></div>
          <div className="col-md-12">
            <label>Payment Method</label>
            <select className="form-select" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="BANK">Bank Transfer (QR)</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Placing...' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  )
}

export default Checkout


