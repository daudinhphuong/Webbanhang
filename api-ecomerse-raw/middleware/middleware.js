import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        // Try multiple ways to get Authorization header
        const authHeader = req.header('Authorization') || req.headers.authorization || req.headers.Authorization;
        console.log('Auth middleware - Request path:', req.path);
        console.log('Auth middleware - Request method:', req.method);
        console.log('Auth middleware - Auth header (req.header):', req.header('Authorization') ? 'present' : 'missing');
        console.log('Auth middleware - Auth header (req.headers.authorization):', req.headers.authorization ? 'present' : 'missing');
        console.log('Auth middleware - Auth header (req.headers.Authorization):', req.headers.Authorization ? 'present' : 'missing');
        console.log('Auth middleware - Final authHeader:', authHeader ? `present (${authHeader.substring(0, 20)}...)` : 'missing');
        console.log('Auth middleware - All headers keys:', Object.keys(req.headers));
        
        const token = authHeader?.replace('Bearer ', '').replace('bearer ', '');

        if (!token) {
            console.log('Auth middleware - No token provided in request');
            return res.status(401).json({ 
                success: false,
                error: 'No token provided',
                message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.' 
            });
        }

        console.log('Auth middleware - Token received:', token.substring(0, 20) + '...');
        const decoded = jwt.verify(token, 'dunglv');
        console.log('Auth middleware - Token decoded successfully:', decoded);
        
        // Allow hardcoded admin bypass
        if (decoded?.adminOverride === true && decoded?.username === 'admin') {
            req.user = { _id: 'admin', username: 'admin', isAdmin: true, role: 'admin', isActive: true };
            req.token = token;
            return next();
        }

        console.log('Auth middleware - Looking for user with id:', decoded.id);
        console.log('Auth middleware - ID type:', typeof decoded.id);
        
        // Try to find user by id (could be ObjectId or UUID string)
        let user = await User.findById(decoded.id);
        
        // If not found by ObjectId, try as string
        if (!user && decoded.id) {
            console.log('Auth middleware - Trying to find user with string id');
            user = await User.findOne({ _id: decoded.id });
        }
        
        // If still not found, try by username
        if (!user && decoded.username) {
            console.log('Auth middleware - Trying to find user by username:', decoded.username);
            user = await User.findOne({ username: decoded.username });
        }
        
        console.log('Auth middleware - User found:', user ? 'yes' : 'no');
        
        if (!user) {
            console.log('Auth middleware - User not found for token id:', decoded.id);
            return res.status(401).json({ 
                success: false,
                error: 'User not found',
                message: 'Người dùng không tồn tại.' 
            });
        }

        console.log('Auth middleware - User authenticated:', user.username, 'id:', user._id);
        
        // Check if user account is locked/banned
        if (user.isActive === false) {
            console.log('Auth middleware - User account is locked:', user.username);
            return res.status(403).json({ 
                success: false,
                error: 'Account locked',
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.',
                accountLocked: true // Flag để frontend biết cần đăng xuất
            });
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ 
            success: false,
            error: 'Token is not valid or expired',
            message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' 
        });
    }
};

export { authMiddleware };

const adminOnly = (req, res, next) => {
    try {
        const user = req.user;
        console.log('ADMIN_CHECK:', { 
            userId: user?._id, 
            username: user?.username, 
            isAdmin: user?.isAdmin, 
            role: user?.role,
            path: req.path
        });
        if (!user) {
            console.log('ADMIN_ACCESS_DENIED: No user');
            return res.status(401).json({ error: 'Unauthorized', message: 'Vui lòng đăng nhập' });
        }
        if (user.isAdmin === true || user.role === 'admin') {
            console.log('ADMIN_ACCESS_GRANTED');
            return next();
        }
        // Temporary: allow access if isAdmin is truthy (for debugging)
        if (user.isAdmin) {
            console.log('ADMIN_ACCESS_GRANTED (isAdmin truthy)');
            return next();
        }
        console.log('ADMIN_ACCESS_DENIED: User is not admin');
        return res.status(403).json({ error: 'Forbidden', message: 'Bạn không có quyền truy cập' });
    } catch (e) {
        console.log('ADMIN_CHECK_ERROR:', e.message);
        return res.status(403).json({ error: 'Forbidden', message: 'Lỗi kiểm tra quyền' });
    }
};

export { adminOnly };