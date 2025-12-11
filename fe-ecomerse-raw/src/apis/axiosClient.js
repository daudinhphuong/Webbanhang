import axios from 'axios';
import Cookies from 'js-cookie';

// Event emitter for account locked
const accountLockedEvent = new Event('accountLocked');

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const handleRequestSuccess = async (config) => {
    const token = Cookies.get('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Axios request - Token added to header:', token.substring(0, 20) + '...');
    } else {
        console.log('Axios request - No token found in cookies');
    }

    return config;
};

const handleRequestErr = (err) => {
    return Promise.reject(err);
};

const handleResponseSuccess = (res) => {
    return res;
};

const handleResponseErr = async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;
    const errorData = err.response?.data;

    // Handle account locked (403 with accountLocked flag)
    if (status === 403 && errorData?.accountLocked) {
        console.log('Account locked - showing modal');
        // Dispatch event to show modal instead of auto redirect
        window.dispatchEvent(accountLockedEvent);
        return Promise.reject(err);
    }

    // Handle 401 Unauthorized
    if (err.response && err.response.status === 401) {
        // Don't retry if it's already a retry or if there's no refresh token
        if (!originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = Cookies.get('refreshToken');

            // Try to refresh token if refresh token exists
            if (refreshToken) {
                try {
                    const res = await axiosClient.post('/refresh-token', {
                        token: refreshToken
                    });

                    const newAccessToken = res.data.accessToken;
                    if (newAccessToken) {
                        Cookies.set('token', newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axiosClient(originalRequest);
                    }
                } catch (error) {
                    // Refresh failed, clear tokens
                    Cookies.remove('token');
                    Cookies.remove('refreshToken');
                    Cookies.remove('userId');
                }
            }
        }
        
        // If we get here, token is invalid/expired and no refresh possible
        // Don't log error for /user/profile if it's just missing token (normal for logged out users)
        const isProfileEndpoint = originalRequest.url?.includes('/user/profile');
        if (!isProfileEndpoint) {
            console.warn('401 Unauthorized:', originalRequest.url);
        }
        
        return Promise.reject(err);
    }
    
    return Promise.reject(err);
};

axiosClient.interceptors.request.use(
    (config) => handleRequestSuccess(config),
    (err) => handleRequestErr(err)
);

axiosClient.interceptors.response.use(
    (config) => handleResponseSuccess(config),
    (err) => handleResponseErr(err)
);

export default axiosClient;
