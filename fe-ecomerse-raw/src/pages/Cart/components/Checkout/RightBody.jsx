import { useContext, useState } from 'react';
import styles from './Styles.module.scss';
import { SideBarContext } from '@/contexts/SideBarProvider';
import Button from '@components/Button/Button';
import { handleTotalPrice } from '@/utils/helper';
import { createOrder } from '@/apis/orderService';
import { useNavigate } from 'react-router-dom';
import { deleteCart } from '@/apis/cartService';
import Cookies from 'js-cookie';
import { ToastContext } from '@/contexts/ToastProvider';
import { StoreContext } from '@/contexts/storeProvider';

function RightBody() {
  const { rightBody, title, items, item, total, subTotal, payment, btn } =
    styles;

  const { listProductCart, setListProductCart, setIsOpen } = useContext(SideBarContext);
  const { toast } = useContext(ToastContext);
  const { userInfo, appliedCoupon, calculateDiscount, calculateFinalTotal } = useContext(StoreContext);
  const [method, setMethod] = useState('qr');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  // Lưu ý: acc phải đúng mã tài khoản nhận QR được SePay cấp
  const [bankInfo] = useState({ bank: 'MBBank', acc: 'VQRQAFQTK9276', owner: 'DAU DINH PHUONG' });

  const handleCloseQr = async () => {
    try {
      const userId = Cookies.get('userId');
      if (userId) {
        try { await deleteCart({ userId }) } catch { }
      }
      setListProductCart?.([]);
    } finally {
      setQrOpen(false);
      navigate(`/`);
    }
  };

  const onPlaceOrder = async () => {
    if (loading) return;
    const userId = Cookies.get('userId');
    if (!userId) {
      toast?.error?.('Vui lòng đăng nhập trước khi đặt hàng');
      return;
    }
    if (!Array.isArray(listProductCart) || listProductCart.length === 0) {
      toast?.error?.('Giỏ hàng của bạn đang trống');
      return;
    }
    try {
      setLoading(true);
      // Sử dụng thông tin user thật thay vì dữ liệu giả
      const payload = {
        firstName: userInfo?.name?.split(' ')[0] || 'User',
        lastName: userInfo?.name?.split(' ').slice(1).join(' ') || 'Name',
        country: 'Vietnam',
        street: userInfo?.address || 'Chưa cập nhật',
        apartment: '',
        cities: userInfo?.city || 'Hà Nội',
        state: userInfo?.state || 'Hà Nội',
        phone: userInfo?.phone || '0000000000',
        zipCode: userInfo?.zipCode || '10000',
        email: userInfo?.email || 'user@example.com',
        // Backend enum: ['COD','VNPay','MoMo','PayPal'] – dùng 'VNPay' cho QR bank
        paymentMethod: method === 'cod' ? 'COD' : 'VNPay',
        // Include coupon information
        couponCode: appliedCoupon?.code || null,
        couponId: appliedCoupon?._id || null,
        discountAmount: calculateDiscount(),
        finalTotal: calculateFinalTotal()
      };
      const res = await createOrder(payload);
      const order = res?.data?.data;
      if (!order?._id) return;
      const total = calculateFinalTotal();
      if (method === 'cod') {
        // clear cart then go home
        if (userId) {
          try { await deleteCart({ userId }) } catch { }
        }
        navigate(`/`);
      } else {
        const vnd = Math.round(Number(total) || 0);
        const url = `https://qr.sepay.vn/img?acc=VQRQAFQTK9276&bank=MBBank&amount=${vnd}&des=ORDER_${order._id}`;
        setQrUrl(url);
        setQrOpen(true);
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        toast?.error?.('Vui lòng đăng nhập trước khi đặt hàng');
      } else {
        toast?.error?.('Đặt hàng thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={rightBody}>
      <p className={title}> YOUR ORDER</p>

      <div className={items}>
        {listProductCart.map((product) => (
          <div className={item}>
            <img src={product.images[0]} alt="" />

            <div>
              <p>{product.name}</p>
              <p>Price: {product.price}</p>
              <p>Size: {product.size}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={subTotal}>
        <p>Subtotal</p>
        <p>${handleTotalPrice(listProductCart).toFixed(2)}</p>
      </div>

      {appliedCoupon && (
        <div className={subTotal} style={{ color: '#28a745' }}>
          <p>Discount ({appliedCoupon.code})</p>
          <p>-${calculateDiscount().toFixed(2)}</p>
        </div>
      )}

      <div className={total}>
        <p>TOTAL</p>
        <p>${calculateFinalTotal().toFixed(2)}</p>
      </div>

      <div className={payment}>
        <input type="radio" id="qr" name="pay_method" value="qr" checked={method === 'qr'} onChange={() => setMethod('qr')} /> {' '}
        <label htmlFor="qr">QR CODE</label>
      </div>

      <div>
        <input type="radio" id="cod" name="pay_method" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} /> {' '}
        <label htmlFor="cod">COD</label>
      </div>

      <div className={btn}>
        <Button content={loading ? 'PLACING...' : 'PLACE ORDER'} onClick={onPlaceOrder} />
      </div>

      {qrOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#111', color: '#fff', padding: 20, borderRadius: 8, maxWidth: 980, width: '90%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '8px 0' }}>Quét mã QR để thanh toán</p>
              <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: 360, background: '#fff', padding: 8, borderRadius: 8 }} />
            </div>
            <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 8 }}>
              <h4 style={{ marginTop: 0 }}>{bankInfo.bank}</h4>
              <div style={{ margin: '8px 0' }}>
                <div>Chủ tài khoản</div>
                <strong>{bankInfo.owner}</strong>
              </div>
              <div style={{ margin: '8px 0' }}>
                <div>Số tài khoản</div>
                <strong>{bankInfo.acc}</strong>
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button content={'Đóng'} onClick={handleCloseQr} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RightBody;
