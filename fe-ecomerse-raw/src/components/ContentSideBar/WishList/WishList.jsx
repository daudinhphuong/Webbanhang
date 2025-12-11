import HeaderSideBar from '@components/ContentSideBar/components/HeaderSidebar/HeaderSideBar';
import { CiHeart } from 'react-icons/ci';
import styles from './styles.module.scss';
import ItemProduct from '@components/ContentSideBar/components/ItemProduct/ItemProduct';
import Button from '@components/Button/Button';
import { useContext } from 'react';
import { SideBarContext } from '@/contexts/SideBarProvider';

function WishList() {
    const { container, boxBtn } = styles;
    const { wishlistItems, userId } = useContext(SideBarContext);
    return (
        <div className={container}>
            <div>
                <HeaderSideBar
                    icon={
                        <CiHeart
                            style={{
                                fontSize: '30px'
                            }}
                        />
                    }
                    title='DANH SÁCH YÊU THÍCH'
                />

                {wishlistItems.map((p) => (
                    <ItemProduct
                        key={p._id || p.id}
                        src={p.images?.[0]}
                        nameProduct={p.name}
                        priceProduct={p.price}
                        skuProduct={p.type}
                        sizeProduct={Array.isArray(p.size) ? (p.size[0]?.name || p.size[0]?.label || '') : ''}
                        productId={p._id || p.id}
                        userId={userId}
                    />
                ))}
            </div>

            <div className={boxBtn}>
                <Button content={'XEM DANH SÁCH YÊU THÍCH'} />
                <Button content={'THÊM TẤT CẢ VÀO GIỞ HÀNG'} isPriamry={false} />
            </div>
        </div>
    );
}

export default WishList;
