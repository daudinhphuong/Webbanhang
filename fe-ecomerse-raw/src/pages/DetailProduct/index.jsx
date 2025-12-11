import { getDetailProduct, getRelatedProduct } from '@/apis/productsService';
import InformationProduct from '@/pages/DetailProduct/components/Infomation';
import ReviewProduct from '@/pages/DetailProduct/components/Review';
import { handleAddProductToCartCommon } from '@/utils/helper';
import AccordionMenu from '@components/AccordionMenu';
import Button from '@components/Button/Button';
import MyFooter from '@components/Footer/Footer';
import MyHeader from '@components/Header/Header';
import MainLayout from '@components/Layout/Layout';
import LoadingTextCommon from '@components/LoadingTextCommon/LoadingTextCommon';
import PaymentMethods from '@components/PaymentMethods/PaymentMethods';
import SliderCommon from '@components/SliderCommon/SliderCommon';
import cls from 'classnames';
import { useEffect, useState } from 'react';
import { CiHeart } from 'react-icons/ci';
import { TfiReload } from 'react-icons/tfi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ReactImageMagnifier from 'simple-image-magnifier/react';
import styles from './styles.module.scss';
import { useContext } from 'react';
import { SideBarContext } from '@/contexts/SideBarProvider';
import { ToastContext } from '@/contexts/ToastProvider';
import Cookies from 'js-cookie';
import { addProductToCart } from '@/apis/cartService';

const INCREMENT = 'increment';
const DECREMENT = 'decrement';

function DetailProduct() {
    const {
        container,
        navigateSection,
        contentSection,
        price,
        imageBox,
        infoBox,
        description,
        boxSize,
        size,
        titleSize,
        functionInfo,
        boxBtn,
        incrementAmount,
        orSection,
        addFunc,
        info,
        active,
        clear,
        activeDisabledBtn,
        loading,
        emptyData
    } = styles;

    const [menuSelected, setMenuSelected] = useState(1);
    const [sizeSelected, setSizeSelected] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [data, setData] = useState();
    const [relatedData, setRelatedData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const param = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setIsOpen, setType, handleGetListProductsCart, addToWishlist, addToCompare } =
        useContext(SideBarContext);
    const { toast } = useContext(ToastContext);
    const userId = Cookies.get('userId');
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [isLoadingBtnBuyNow, setIsLoadingBtnBuyNow] = useState(false);

    const [reviewCount, setReviewCount] = useState(0)

    // Auto-open review section if review=true in query params
    useEffect(() => {
        if (searchParams.get('review') === 'true') {
            setMenuSelected(2) // Review section is id 2
        }
    }, [searchParams])

    const handleRenderZoomImage = (src) => {
        return (
            <ReactImageMagnifier
                srcPreview={src}
                srcOriginal={src}
                width={295}
                height={350}
            />
        );
    };

    const handleSetMenuSelected = (id) => {
        setMenuSelected(id);
    };

    const handleSelectedSize = (size) => {
        setSizeSelected(size);
    };

    const handleClearSizeSeleted = () => {
        setSizeSelected('');
    };

    const handleSetQuantity = (type) => {
        if (quantity < 1) return;

        setQuantity((prev) =>
            type === INCREMENT ? (prev += 1) : quantity === 1 ? 1 : (prev -= 1)
        );
    };

    const fetchDataDetail = async (id) => {
        setIsLoading(true);
        try {
            const data = await getDetailProduct(id);

            setData(data);
            setIsLoading(false);
        } catch (error) {
            toast.error('Có lỗi khi tải dữ liệu');
            setData();
            setIsLoading(false);
        }
    };

    const fetchDataRelatedProduct = async (id) => {
        setIsLoading(true);
        try {
            const data = await getRelatedProduct(id);
            setRelatedData(data);
            setIsLoading(false);
        } catch (error) {
            setRelatedData([]);
            toast.error('Có lỗi khi tải dữ liệu');
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        handleAddProductToCartCommon(
            userId,
            setIsOpen,
            setType,
            toast,
            sizeSelected,
            param.id,
            quantity,
            setIsLoadingBtn,
            handleGetListProductsCart
        );
    };

    const handleBuyNow = () => {
        const data = {
            userId,
            productId: param.id,
            quantity,
            size: sizeSelected
        };

        setIsLoadingBtnBuyNow(true);
        addProductToCart(data)
            .then((res) => {
                toast.success('Thêm sản phẩm vào giỏ hàng thành công!');
                setIsLoadingBtnBuyNow(false);
                navigate('/cart');
            })
            .catch((err) => {
                toast.error('Thêm sản phẩm vào giỏ hàng thất bại!');
                setIsLoadingBtnBuyNow(false);
            });
    };

    useEffect(() => {
        if (param.id) {
            fetchDataDetail(param.id);
            fetchDataRelatedProduct(param.id);
        }
    }, [param]);

    return (
        <div>
            <MyHeader />

            <div className={container}>
                <MainLayout>
                    <div className={navigateSection}>
                        <div>Trang chủ {'>'} Nam</div>
                        <div className='' style={{ cursor: 'pointer' }}>
                            {'<'} Quay lại trang trước{' '}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className={loading}>
                            <LoadingTextCommon />
                        </div>
                    ) : (
                        <>
                            {!data ? (
                                <div className={emptyData}>
                                    <p>Không có kết quả</p>
                                    <div>
                                        <Button
                                            content={'Quay lại cửa hàng'}
                                            onClick={() => navigate('/shop')}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className={contentSection}>
                                    <div className={imageBox}>
                                        {data?.images.map((src, idx) => (
                                            <ReactImageMagnifier
                                                key={src || idx}
                                                srcPreview={src}
                                                srcOriginal={src}
                                                width={295}
                                                height={350}
                                            />
                                        ))}
                                    </div>
                                    <div className={infoBox}>
                                        <h1>{data?.name}</h1>
                                        <p className={price}>${data?.price}</p>
                                        <p className={description}>
                                            {data?.description}
                                        </p>

                                        <p className={titleSize}>
                                            Kích cỡ {sizeSelected}
                                        </p>
                                        <div className={boxSize}>
                                            {data?.size.map((itemSize, index) => {
                                                const label = typeof itemSize === 'string' ? itemSize : itemSize?.name;
                                                return (
                                                    <div
                                                        className={cls(
                                                            size,
                                                            {
                                                                [active]:
                                                                    sizeSelected ===
                                                                    label
                                                            }
                                                        )}
                                                        key={label || index}
                                                        onClick={() =>
                                                            handleSelectedSize(
                                                                label
                                                            )
                                                        }
                                                    >
                                                        {label}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {sizeSelected && (
                                            <p
                                                className={clear}
                                                onClick={handleClearSizeSeleted}
                                            >
                                                xóa
                                            </p>
                                        )}

                                        <div className={functionInfo}>
                                            <div className={incrementAmount}>
                                                <div
                                                    onClick={() =>
                                                        handleSetQuantity(
                                                            DECREMENT
                                                        )
                                                    }
                                                >
                                                    -
                                                </div>
                                                <div>{quantity}</div>
                                                <div
                                                    onClick={() =>
                                                        handleSetQuantity(
                                                            INCREMENT
                                                        )
                                                    }
                                                >
                                                    +
                                                </div>
                                            </div>

                                            <div className={boxBtn}>
                                                <Button
                                                    content={
                                                        isLoadingBtn ? (
                                                            <LoadingTextCommon />
                                                        ) : (
                                                            'Thêm vào giỏ hàng'
                                                        )
                                                    }
                                                    customClassname={
                                                        !sizeSelected &&
                                                        activeDisabledBtn
                                                    }
                                                    onClick={handleAdd}
                                                />
                                            </div>
                                        </div>

                                        <div className={orSection}>
                                            <div></div>
                                            <span>HOẶC</span>
                                            <div></div>
                                        </div>

                                        <div>
                                            <Button
                                                content={
                                                    isLoadingBtnBuyNow ? (
                                                        <LoadingTextCommon />
                                                    ) : (
                                                        'Mua ngay'
                                                    )
                                                }
                                                customClassname={
                                                    !sizeSelected &&
                                                    activeDisabledBtn
                                                }
                                                onClick={handleBuyNow}
                                            />
                                        </div>

                                        <div className={addFunc}>
                                            <div
                                                onClick={() => {
                                                    if (data) addToWishlist(data);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <CiHeart />
                                            </div>

                                            <div
                                                onClick={() => {
                                                    if (data) addToCompare(data);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <TfiReload />
                                            </div>
                                        </div>

                                        <div>
                                            <PaymentMethods />
                                        </div>

                                        <div className={info}>
                                            <div>
                                                Thương hiệu: <span>{data?.brand?.name || data?.brandName || data?.brandId || '-'}</span>
                                            </div>

                                            <div>
                                                SKU: <span>{data?.type || '-'}</span>
                                            </div>

                                            <div>
                                                Danh mục: <span>{data?.category?.name || data?.categoryName || data?.categoryId || '-'}</span>
                                            </div>
                                        </div>

                                        {[
                                            {
                                                id: 1,
                                                titleMenu: 'THÔNG TIN BỔ SUNG',
                                                content: <InformationProduct />
                                            },
                                            {
                                                id: 2,
                                                titleMenu: `ĐÁNH GIÁ (${reviewCount})`,
                                                content: <ReviewProduct onReviewCountChange={setReviewCount} />
                                            }
                                        ].map((item) => (
                                            <AccordionMenu
                                                titleMenu={item.titleMenu}
                                                contentJsx={item.content}
                                                key={item.id}
                                                onClick={() =>
                                                    handleSetMenuSelected(
                                                        item.id
                                                    )
                                                }
                                                isSelected={
                                                    menuSelected === item.id
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {relatedData.length ? (
                        <div>
                            <h2>Sản phẩm liên quan</h2>

                            <SliderCommon
                                data={relatedData}
                                isProductItem
                                showItem={4}
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                </MainLayout>
            </div>

            <MyFooter />
        </div>
    );
}

export default DetailProduct;
