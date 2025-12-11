import React, { useEffect } from 'react';
import styles from '../../styles.module.scss';
import Button from '@components/Button/Button';
import cls from 'classnames';
import { useContext } from 'react';
import { SideBarContext } from '@/contexts/SideBarProvider';
import { StoreContext } from '@/contexts/storeProvider';
import LoadingCart from '@/pages/Cart/components/Loading';
import PaymentMethods from '@components/PaymentMethods/PaymentMethods';
import { StepperContext } from '@/contexts/SteperProvider';
import { handleTotalPrice } from '@/utils/helper';
import CouponInput from '@components/CouponInput/CouponInput';

const CartSummary = () => {
  const {
    containerSummary,
    title,
    boxTotal,
    price,
    subTotal,
    totals,
    space,
    containerRight,
    discountRow,
    finalTotal,
  } = styles;
  const { listProductCart, isLoading } = useContext(SideBarContext);
  const {
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCartTotal,
    calculateDiscount,
    calculateFinalTotal
  } = useContext(StoreContext);
  const { setCurrentStep } = useContext(StepperContext);

  const subtotal = handleTotalPrice(listProductCart);
  const discount = calculateDiscount();
  const finalTotalAmount = calculateFinalTotal();

  // Update cart total when subtotal changes
  useEffect(() => {
    setCartTotal(subtotal);
  }, [subtotal, setCartTotal]);

  const handleProcessCheckout = () => {
    setCurrentStep(2);
  };

  return (
    <div className={containerRight}>
      <div className={containerSummary}>
        <div className={title}>TỔNG GIỞ HÀNG</div>

        <div className={cls(boxTotal, subTotal)}>
          <div>Tạm tính</div>
          <div className={price}>
            ${subtotal.toFixed(2)}
          </div>
        </div>

        {/* Coupon Input */}
        <CouponInput
          onCouponApplied={applyCoupon}
          appliedCoupon={appliedCoupon}
          onRemoveCoupon={removeCoupon}
        />

        {/* Discount Row */}
        {discount > 0 && (
          <div className={cls(boxTotal, discountRow)}>
            <div>Giảm giá ({appliedCoupon?.code})</div>
            <div className={price} style={{ color: '#28a745' }}>
              -${discount.toFixed(2)}
            </div>
          </div>
        )}

        <div className={cls(boxTotal, totals, finalTotal)}>
          <div>TỔNG CỘNG</div>
          <div>${finalTotalAmount.toFixed(2)}</div>
        </div>

        <Button
          content={'TIẾN HÀNH THANH TOÁN'}
          onClick={handleProcessCheckout}
        />
        <div className={space} />
        <Button content={'TIẾP TỤC MUA SẮM'} isPriamry={false} />

        {isLoading && <LoadingCart />}
      </div>

      <PaymentMethods />
    </div>
  );
};

export default CartSummary;
