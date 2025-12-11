import InputCommon from '@components/InputCommon/InputCommon';
import styles from './styles.module.scss';
import Button from '@components/Button/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastProvider';
import { register, signIn, getInfo } from '@/apis/authService';
import Cookies from 'js-cookie';
import { SideBarContext } from '@/contexts/SideBarProvider';
import { StoreContext } from '@/contexts/storeProvider';

function Login() {
    const { container, title, boxRememberMe, lostPw } = styles;
    const [isRegister, setIsRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useContext(ToastContext);
    const { setIsOpen, handleGetListProductsCart } = useContext(SideBarContext);
    const { setUserId } = useContext(StoreContext);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            cfmpassword: '',
            name: '',
            phone: '',
            address: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Email là bắt buộc'),
            password: Yup.string()
                .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
                .required('Mật khẩu là bắt buộc'),
            cfmpassword: Yup.string().oneOf(
                [Yup.ref('password'), null],
                'Mật khẩu không khớp'
            ),
            name: Yup.string()
                .min(2, 'Tên phải có ít nhất 2 ký tự'),
            phone: Yup.string()
                .matches(/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Số điện thoại không hợp lệ'),
            address: Yup.string()
                .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
        }),

        onSubmit: async (values) => {
            if (isLoading) return;

            const { email, password, name, phone, address } = values;

            setIsLoading(true);

            try {
                if (isRegister) {
                    // Validate required fields for registration
                    if (!name || !phone || !address) {
                        toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
                        return;
                    }

                    console.log('Form values:', values);
                    console.log('Destructured values:', { email, password, name, phone, address });
                    console.log('Sending registration request:', {
                        username: email, // Use email as username
                        password,
                        name,
                        email: email, // Use email as email field too
                        phone,
                        address
                    });

                    // Check if user already exists before sending request
                    console.log('Checking if user exists...');

                    const res = await register({
                        username: email, // Use email as username
                        password,
                        name,
                        email: email, // Use email as email field too
                        phone,
                        address
                    });

                    console.log('Registration response:', res);
                    toast.success(res.data.message || 'Tạo tài khoản thành công');
                    // Reset form after successful registration
                    formik.resetForm();
                    // Switch to login mode
                    setIsRegister(false);
                } else {
                    const res = await signIn({ username: email, password });
                    const accessToken = res?.data?.accessToken || res?.data?.token;
                    const refreshToken = res?.data?.refreshToken;
                    const userIdFromApi = res?.data?.user?.id || res?.data?.id;
                    if (!accessToken || !refreshToken || !userIdFromApi) {
                        throw new Error('Phản hồi đăng nhập không hợp lệ');
                    }
                    setUserId(userIdFromApi);
                    Cookies.set('token', accessToken);
                    Cookies.set('refreshToken', refreshToken);
                    Cookies.set('userId', userIdFromApi);
                    toast.success('Đăng nhập thành công!');
                    setIsOpen(false);
                    handleGetListProductsCart(userIdFromApi, 'cart');
                }
            } catch (err) {
                console.error('API error:', err);
                console.error('Error response:', err.response);
                console.error('Error data:', err.response?.data);
                if (isRegister) {
                    const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Đăng ký thất bại';
                    toast.error(errorMessage);
                } else {
                    // Handle specific error cases
                    if (err.response?.status === 403) {
                        toast.error('Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.');
                    } else if (err.response?.status === 400) {
                        const errorMessage = err.response?.data?.message || 'Thông tin đăng nhập không chính xác';
                        toast.error(errorMessage);
                    } else {
                        toast.error('Đăng nhập thất bại!');
                    }
                }
            } finally {
                // Always reset loading state
                setIsLoading(false);
            }
        }
    });

    const handleToggle = () => {
        setIsRegister(!isRegister);
        formik.resetForm();
    };

    return (
        <div className={container}>
            <div className={title}>{isRegister ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}</div>

            <form onSubmit={formik.handleSubmit}>
                {isRegister && (
                    <InputCommon
                        id='name'
                        label='Họ và tên'
                        type='text'
                        isRequired
                        formik={formik}
                    />
                )}

                <InputCommon
                    id='email'
                    label='Email'
                    type='text'
                    isRequired
                    formik={formik}
                />

                {isRegister && (
                    <InputCommon
                        id='phone'
                        label='Số điện thoại'
                        type='text'
                        isRequired
                        formik={formik}
                    />
                )}

                {isRegister && (
                    <InputCommon
                        id='address'
                        label='Địa chỉ'
                        type='text'
                        isRequired
                        formik={formik}
                    />
                )}

                <InputCommon
                    id='password'
                    label='Mật khẩu'
                    type='password'
                    isRequired
                    formik={formik}
                />

                {isRegister && (
                    <InputCommon
                        id='cfmpassword'
                        label='Xác nhận mật khẩu'
                        type='password'
                        isRequired
                        formik={formik}
                    />
                )}

                {!isRegister && (
                    <div className={boxRememberMe}>
                        <input type='checkbox' />
                        <span>Ghi nhớ tôi</span>
                    </div>
                )}

                <Button
                    content={
                        isLoading
                            ? 'ĐANG TẢI...'
                            : isRegister
                                ? 'ĐĂNG KÝ'
                                : 'ĐĂNG NHẬP'
                    }
                    type='submit'
                />
            </form>

            <Button
                content={
                    isRegister
                        ? 'Already have an account?'
                        : 'Don’t have an account?'
                }
                isPriamry={false}
                style={{ marginTop: '10px' }}
                onClick={handleToggle}
            />

            {!isRegister && <div className={lostPw}>Quên mật khẩu?</div>}
        </div>
    );
}

export default Login;
