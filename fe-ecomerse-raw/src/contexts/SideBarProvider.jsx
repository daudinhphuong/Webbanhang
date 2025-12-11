import { useState } from 'react';
import { createContext } from 'react';
import { getCart } from '@/apis/cartService';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export const SideBarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('');
    const [listProductCart, setListProductCart] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);
    const userId = Cookies.get('userId');
    const [wishlistItems, setWishlistItems] = useState([]);
    const [compareItems, setCompareItems] = useState([]);

    const handleGetListProductsCart = (userId, type) => {
        if (userId && type === 'cart') {
            setIsLoading(true);
            getCart(userId)
                .then((res) => {
                    setListProductCart(res.data.data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    setListProductCart([]);
                    setIsLoading(false);
                });
        }
    };

    const addToWishlist = (product) => {
        if (!product) return;
        setWishlistItems((prev) => {
            const exists = prev.some((p) => (p._id || p.id) === (product._id || product.id));
            if (exists) return prev;
            return [...prev, product];
        });
        setIsOpen(true); setType('wishlist');
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    };

    const addToCompare = (product) => {
        if (!product) return;
        setCompareItems((prev) => {
            const exists = prev.some((p) => (p._id || p.id) === (product._id || product.id));
            if (exists) return prev;
            return [...prev, product];
        });
        setIsOpen(true); setType('compare');
    };

    const removeFromCompare = (productId) => {
        setCompareItems((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    };

    const value = {
        isOpen,
        setIsOpen,
        type,
        setType,
        handleGetListProductsCart,
        listProductCart,
        isLoading,
        setIsLoading,
        userId,
        detailProduct,
        setDetailProduct,
        setListProductCart,
        wishlistItems,
        compareItems,
        addToWishlist,
        removeFromWishlist,
        addToCompare,
        removeFromCompare
    };

    // Persistence: load from localStorage when userId changes
    useEffect(() => {
        if (!userId) {
            setWishlistItems([])
            setCompareItems([])
            return
        }
        try {
            const wl = localStorage.getItem(`wishlist:${userId}`)
            const cp = localStorage.getItem(`compare:${userId}`)
            setWishlistItems(wl ? JSON.parse(wl) : [])
            setCompareItems(cp ? JSON.parse(cp) : [])
        } catch (e) {
            setWishlistItems([])
            setCompareItems([])
        }
    }, [userId])

    // Save when lists change
    useEffect(() => {
        if (!userId) return
        try { localStorage.setItem(`wishlist:${userId}`, JSON.stringify(wishlistItems)) } catch {}
    }, [userId, wishlistItems])
    useEffect(() => {
        if (!userId) return
        try { localStorage.setItem(`compare:${userId}`, JSON.stringify(compareItems)) } catch {}
    }, [userId, compareItems])

    return (
        <SideBarContext.Provider value={value}>
            {children}
        </SideBarContext.Provider>
    );
};
