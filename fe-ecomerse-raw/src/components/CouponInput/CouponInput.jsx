import React, { useState } from 'react';
import { validateCoupon } from '@/apis/couponService';
import { validateCampaign } from '@/apis/campaignService';
import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastProvider';
import { StoreContext } from '@/contexts/storeProvider';
import styles from './styles.module.scss';

const CouponInput = ({ onCouponApplied, appliedCoupon, onRemoveCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useContext(ToastContext);
  const { cartTotal } = useContext(StoreContext);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    setLoading(true);
    try {
      // Try coupon first
      try {
        const response = await validateCoupon(couponCode.trim().toUpperCase(), cartTotal);
        if (response.success) {
          onCouponApplied(response.data.coupon);
          setCouponCode('');
          toast.success(`Áp dụng mã giảm giá "${response.data.coupon.code}" thành công!`);
          return;
        }
      } catch (err) {
        // Fallback to campaign code
        const res2 = await validateCampaign(couponCode.trim(), undefined, cartTotal);
        if (res2.success) {
          onCouponApplied({
            _id: res2.data.campaign._id,
            code: res2.data.campaign.name,
            type: res2.data.campaign.type,
            value: res2.data.campaign.value,
            discountAmount: res2.data.campaign.discountAmount,
          });
          setCouponCode('');
          toast.success(`Áp dụng chiến dịch "${res2.data.campaign.name}" thành công!`);
          return;
        }
        throw err;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Mã ưu đãi không hợp lệ';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    toast.success('Đã xóa mã giảm giá');
  };

  return (
    <div className={styles.couponContainer}>
      {appliedCoupon ? (
        <div className={styles.appliedCoupon}>
          <div className={styles.couponInfo}>
            <span className={styles.couponCode}>{appliedCoupon.code}</span>
            <span className={styles.couponDiscount}>
              -${appliedCoupon.discountAmount}
            </span>
          </div>
          <button 
            type="button" 
            className={styles.removeCoupon}
            onClick={handleRemoveCoupon}
          >
            ✕
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className={styles.couponInput}
              disabled={loading}
            />
            <button 
              type="submit" 
              className={styles.applyButton}
              disabled={loading || !couponCode.trim()}
            >
              {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CouponInput;
