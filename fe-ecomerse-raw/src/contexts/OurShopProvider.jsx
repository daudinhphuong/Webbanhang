import { useEffect } from 'react';
import { useState } from 'react';
import { createContext } from 'react';
import { getProducts } from '@/apis/productsService';
import { getBrands } from '@/apis/brandService';
import { getCategories } from '@/apis/categoryService';

export const OurShopContext = createContext();

export const OurShopProvider = ({ children }) => {
    const sortOptions = [
        { label: 'Default sorting', value: '0' },
        { label: 'Sort by popularity', value: '1' },
        { label: 'Sort by average rating', value: '2' },
        { label: 'Sort by latest', value: '3' },
        { label: 'Sort by price: low to high', value: '4' },
        { label: 'Sort by price: high to low', value: '5' }
    ];

    const showOptions = [
        { label: '8', value: '8' },
        { label: '12', value: '12' },
        { label: 'All', value: 'all' }
    ];

    const [sortId, setSortId] = useState('0');
    const [showId, setShowId] = useState('8');
    const [isShowGrid, setIsShowGrid] = useState(true);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [brands, setBrands] = useState([]);
    const [brandId, setBrandId] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [query, setQuery] = useState('');

    const decorateProducts = (list) => {
        if (!Array.isArray(list)) return []
        const idToBrand = Object.fromEntries((brands || []).map(b => [String(b._id || b.id), b.name]))
        return list.map(p => {
            if (!p?.brand && p?.brandId && idToBrand[String(p.brandId)]) {
                return { ...p, brand: { _id: p.brandId, name: idToBrand[String(p.brandId)] } }
            }
            return p
        })
    }

    const handleLoadMore = () => {
        const params = {
            sortType: sortId,
            page: page + 1,
            limit: showId,
            brandId: brandId || undefined,
            categoryId: categoryId || undefined,
            q: query || undefined,
        };

        setIsLoadMore(true);

        getProducts(params)
            .then((res) => {
                const next = decorateProducts(res.contents)
                setProducts((prev) => [...prev, ...next]);
                setPage(+res.page);
                setTotal(res.total);
                setIsLoadMore(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoadMore(false);
            });
    };

    const values = {
        sortOptions,
        showOptions,
        setSortId,
        setShowId,
        setIsShowGrid,
        products,
        isShowGrid,
        isLoading,
        handleLoadMore,
        total,
        isLoadMore,
        brands,
        brandId,
        setBrandId,
        categories,
        categoryId,
        setCategoryId,
        setQuery,
    };

    useEffect(() => {
        const params = {
            sortType: sortId,
            page: 1,
            limit: showId,
            brandId: brandId || undefined,
            categoryId: categoryId || undefined,
            q: query || undefined,
        };
        setIsLoading(true);
        getProducts(params)
            .then((res) => {
                setProducts(decorateProducts(res.contents));
                setTotal(res.total);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }, [sortId, showId, brandId, categoryId, query]);

    useEffect(() => {
        getBrands()
            .then((list) => setBrands(list))
            .catch(() => setBrands([]))
    }, [])

    useEffect(() => {
        getCategories()
            .then((list) => setCategories(list))
            .catch(() => setCategories([]))
    }, [])

    return (
        <OurShopContext.Provider value={values}>
            {children}
        </OurShopContext.Provider>
    );
};
