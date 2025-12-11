import HeaderSideBar from '@components/ContentSideBar/components/HeaderSidebar/HeaderSideBar';
import { TfiReload } from 'react-icons/tfi';
import styles from './styles.module.scss';
import ItemProduct from '@components/ContentSideBar/components/ItemProduct/ItemProduct';
import Button from '@components/Button/Button';
import { useContext } from 'react';
import { SideBarContext } from '@/contexts/SideBarProvider';

function Compare() {
    const { container, boxContent } = styles;
    const { compareItems, removeFromCompare, userId } = useContext(SideBarContext);
    return (
        <div className={container}>
            <div className={boxContent}>
                <HeaderSideBar
                    icon={<TfiReload style={{ fontSize: '30px' }} />}
                    title='SO SÁNH'
                />
                {compareItems.map((p) => (
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

            <Button content={'XEM SO SÁNH'} />
        </div>
    );
}

export default Compare;
