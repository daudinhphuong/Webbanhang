import { createOrder } from '@/apis/orderService';
import RightBody from '@/pages/Cart/components/Checkout/RightBody';
import InputCustom from '@components/InputCommon2/Input';
import axios from 'axios';
import cls from 'classnames';
import { useEffect, useRef, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { StoreContext } from '@/contexts/storeProvider';
import styles from './Styles.module.scss';
import { useNavigate } from 'react-router-dom';

const CN_BASE = 'https://countriesnow.space/api/v0.1';

function Checkout() {
  const dataOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  const { container, title, coupon, leftBody, rightBody, row, row2Column } =
    styles;

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const navigate = useNavigate();
  const { appliedCoupon, calculateFinalTotal } = useContext(StoreContext);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const formRef = useRef();

  const handleExternalSubmit = () => {
    formRef.current.requestSubmit(); // hoặc formRef.current.dispatchEvent(new Event('submit'))
  };

  const onSubmit = async (data) => {
    try {
      // Include coupon information in order data
      const orderData = {
        ...data,
        couponCode: appliedCoupon?.code || null,
        couponId: appliedCoupon?._id || null,
        discountAmount: appliedCoupon?.discountAmount || 0,
        finalTotal: calculateFinalTotal()
      };
      
      const res = await createOrder(orderData);
      navigate(
        `/order?id=${res.data.data._id}&totalAmount=${res.data.data.totalAmount}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    axios.get(`${CN_BASE}/countries/iso`).then((res) =>
      setCountries(
        res.data.data.map((c) => ({
          value: c.name,
          label: c.name,
        }))
      )
    );
  }, []);

  useEffect(() => {
    if (!watch('country')) return;

    if (watch('country') === 'Vietnam' && !localStorage.getItem('listCities')) {
      axios.get('https://provinces.open-api.vn/api/?depth=2').then((res) => {
        localStorage.setItem('listCities', JSON.stringify(res.data));

        setCities(
          res.data.data.map((item) => ({
            label: item.name,
            value: item.codename,
          }))
        );
      });

      return;
    }

    if (localStorage.getItem('listCities')) {
      const data = JSON.parse(localStorage.getItem('listCities'));
      setCities(
        data.map((item) => ({
          label: item.name,
          value: item.codename,
        }))
      );
    }
  }, [watch('country')]);

  useEffect(() => {
    if (!watch('cities')) return;

    if (localStorage.getItem('listCities')) {
      const data = JSON.parse(localStorage.getItem('listCities'));
      const statesCustom = data
        .find((item) => item.codename === watch('cities'))
        .districts.map((item) => ({
          label: item.name,
          value: item.codename,
        }));

      setStates(statesCustom);
    }
  }, [watch('cities')]);

  return (
    <div className={container}>
      <div className={leftBody}>
        <p className={coupon}>
          Have a coupon? <span>Click here to enter</span>
        </p>

        <p className={title}>BILLING DETAILS</p>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className={cls(row, row2Column)}>
            <InputCustom
              label={'First Name'}
              type={'text'}
              isRequired
              register={register('firstName', {
                required: true,
                maxLength: 25,
              })}
              isError={errors.firstName}
            />
            <InputCustom
              label={'Last Name'}
              type={'text'}
              isRequired
              register={register('lastName', {
                required: true,
                maxLength: 25,
              })}
              isError={errors.lastName}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'Company Name (optional)'}
              type={'text'}
              register={register('companyName')}
              // isError={errors.companyName}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'Country / Region'}
              dataOptions={countries}
              isRequired
              register={register('country', {
                required: true,
              })}
              isError={errors.country}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'Street address'}
              type={'text'}
              isRequired
              register={register('street', {
                required: true,
              })}
              isError={errors.street}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'apartment'}
              type={'text'}
              isShowlabel={false}
              register={register('apartment')}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'Town / City'}
              dataOptions={cities}
              isRequired
              register={register('cities', {
                required: true,
              })}
              isError={errors.cities}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'State'}
              dataOptions={states}
              isRequired
              register={register('state', {
                required: true,
              })}
              isError={errors.state}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'Phone'}
              type={'text'}
              isRequired
              register={register('phone', {
                required: true,
              })}
              isError={errors.phone}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'ZIP code'}
              type={'text'}
              isRequired
              register={register('zipCode', {
                required: true,
              })}
              isError={errors.zipCode}
            />
          </div>

          <div className={row}>
            <InputCustom
              label={'Email Address'}
              type={'text'}
              isRequired
              register={register('email', {
                required: true,
              })}
              isError={errors.email}
            />
          </div>

          {/* <button type="submit">Submit</button> */}
        </form>
      </div>

      <RightBody handleExternalSubmit={handleExternalSubmit} />
    </div>
  );
}

export default Checkout;
