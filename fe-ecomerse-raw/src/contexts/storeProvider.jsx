import { useEffect } from 'react';
import { useState } from 'react';
import { createContext } from 'react';
import Cookies from 'js-cookie';
import { getUserProfile } from '@/apis/userService';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [userId, setUserId] = useState(Cookies.get('userId'));
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [cartTotal, setCartTotal] = useState(0);

    const handleLogOut = () => {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        Cookies.remove('userId');
        setUserInfo(null);
        setAppliedCoupon(null);
        setCartTotal(0);
        window.location.reload();
    };

    const applyCoupon = (coupon) => {
        setAppliedCoupon(coupon);
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        return appliedCoupon.discountAmount || 0;
    };

    const calculateFinalTotal = () => {
        const discount = calculateDiscount();
        return Math.max(0, cartTotal - discount);
    };

    useEffect(() => {
        // Load user info if token exists
        const token = Cookies.get('token');
        const userIdFromCookie = Cookies.get('userId');
        
        if (token && token.trim() !== '') {
            getUserProfile()
                .then((res) => {
                    const profileData = res.data || res || {};
                    // Map profile data to userInfo format
                    const info = {
                        id: profileData._id || profileData.id,
                        username: profileData.username,
                        email: profileData.email,
                        firstName: profileData.firstName,
                        lastName: profileData.lastName,
                        phone: profileData.phone,
                        address: profileData.address,
                        dateOfBirth: profileData.dateOfBirth,
                        gender: profileData.gender,
                        avatar: profileData.avatar,
                        role: profileData.role || 'user',
                        isActive: profileData.isActive
                    };
                    setUserInfo(info);
                    // Update userId cookie if needed
                    if (info.id && info.id !== userId) {
                        setUserId(info.id);
                        Cookies.set('userId', info.id);
                    }
                })
                .catch((err) => {
                    // Only log if it's not a 401 (unauthorized) - token expired/invalid is normal
                    if (err.response?.status !== 401) {
                        console.error('Error loading user profile:', err);
                    }
                    // Clear user info and tokens if token is invalid/expired
                    if (err.response?.status === 401) {
                        setUserInfo(null);
                        // Optionally clear tokens if they're invalid
                        // Cookies.remove('token');
                        // Cookies.remove('refreshToken');
                    }
                });
        } else {
            // No token, clear user info
            setUserInfo(null);
            // If userId exists but no token, clear userId too
            if (userIdFromCookie && !token) {
                setUserId(null);
            }
        }
    }, []); // Only run once on mount

    return (
        <StoreContext.Provider value={{ 
            userInfo,
            setUserInfo,
            handleLogOut, 
            setUserId,
            appliedCoupon,
            applyCoupon,
            removeCoupon,
            cartTotal,
            setCartTotal,
            calculateDiscount,
            calculateFinalTotal
        }}>
            {children}
        </StoreContext.Provider>
    );
};
