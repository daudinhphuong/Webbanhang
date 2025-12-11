import BoxIcon from './BoxIcon/BoxIcon';
import Menu from './Menu/Menu';
import { dataBoxIcon, dataMenu } from './constants';
import styles from './styles.module.scss';
import Logo from '@icons/images/Logo-retina.png';
import { TfiReload } from 'react-icons/tfi';
import { BsHeart } from 'react-icons/bs';
import { PiShoppingCart } from 'react-icons/pi';
import useScrollHandling from '@/hooks/useScrollHandling';
import { useEffect } from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { useContext } from 'react';
import { SideBarContext } from '@/contexts/SideBarProvider';
import { StoreContext } from '@/contexts/storeProvider';
import { useSettings } from '@/contexts/SettingsProvider';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function MyHeader() {
  const {
    containerBoxIcon,
    containerMenu,
    containerHeader,
    containerBox,
    container,
    fixedHeader,
    topHeader,
    boxCart,
    quantity,
  } = styles;

  const { scrollPosition } = useScrollHandling();
  const [fixedPosition, setFixedPosition] = useState(false);
  const {
    setIsOpen,
    setType,
    listProductCart,
    userId,
    handleGetListProductsCart,
  } = useContext(SideBarContext);
  const { userInfo, handleLogOut } = useContext(StoreContext);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const { wishlistItems, compareItems } = useContext(SideBarContext)


  // Use logo from settings if available, otherwise use VNB Store logo
  const headerLogo = settings?.logo || 'https://tse1.mm.bing.net/th/id/OIP.ry7eBCxsh1BiwR2GueQveQHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

  const handleOpenSideBar = (type) => {
    setIsOpen(true);
    setType(type);
  };

  const handleOpenCartSideBar = () => {
    handleGetListProductsCart(userId, 'cart');
    handleOpenSideBar('cart');
  };

  const totalItemCart = listProductCart.length
    ? listProductCart.reduce((acc, item) => {
      return (acc += item.quantity);
    }, 0)
    : 0;

  useEffect(() => {
    setFixedPosition(scrollPosition > 80);
  }, [scrollPosition]);

  const rightMenu = dataMenu
    .slice(3, dataMenu.length)
    .filter((item) => item.content !== 'Sign in')
    .filter((item) => !(item.href === '/order' && !userId))
    .filter((item) => !(item.href === '/support' && !userId)); // Support requires login

  return (
    <div
      className={classNames(container, topHeader, {
        [fixedHeader]: fixedPosition,
      })}
    >
      <div className={containerHeader}>
        <div className={containerBox}>
          <div className={containerBoxIcon}>
            {dataBoxIcon.map((item, idx) => {
              return <BoxIcon key={item?.type || idx} type={item.type} href={item.href} />;
            })}
          </div>
          <div className={containerMenu}>
            {dataMenu.slice(0, 3).map((item, idx) => {
              return <Menu key={item?.href || idx} content={item.content} href={item.href} />;
            })}
          </div>
        </div>
        <div>
          <img
            src={headerLogo}
            alt={settings?.shopName || 'Logo'}
            style={{
              width: '153px',
              height: '53px',
              objectFit: 'contain',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          />
        </div>
        <div className={containerBox}>
          <div className={containerMenu} style={{ position: 'relative' }}>
            {rightMenu.map((item, idx) => {
              return <Menu key={item?.href || idx} content={item.content} href={item.href} />;
            })}
            {(userInfo?.name || Cookies.get('userId')) ? (
              <div style={{ marginLeft: 16, position: 'relative' }}>
                <div
                  onClick={() => setOpenUserMenu((v) => !v)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#2f80ed',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                    title={userInfo?.name || 'Member'}
                  >
                    {(userInfo?.name || 'U')?.[0]?.toUpperCase()}
                  </div>
                </div>
                {openUserMenu && (
                  <div
                    onMouseLeave={() => setOpenUserMenu(false)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 40,
                      background: '#0f172a',
                      color: '#fff',
                      minWidth: 200,
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,.2)',
                      overflow: 'hidden',
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ padding: '10px 12px', fontWeight: 600, opacity: .9 }}>Member</div>
                    <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
                    <button
                      onClick={() => { setOpenUserMenu(false); navigate('/user-settings') }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: '#e5e7eb',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cài đặt
                    </button>
                    <button
                      onClick={() => { setOpenUserMenu(false); navigate('/support') }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: '#e5e7eb',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      Hỗ trợ khách hàng
                    </button>
                    <button
                      onClick={() => { setOpenUserMenu(false); handleLogOut() }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: '#e5e7eb',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginLeft: 16 }}>
                <div
                  onClick={() => { setOpenUserMenu(false); setIsOpen(true); setType('login') }}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#2f80ed',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                    title={'Đăng nhập'}
                  >
                    U
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={containerBoxIcon}>
            <div className={boxCart} onClick={() => handleOpenSideBar('compare')} style={{ cursor: 'pointer' }}>
              <TfiReload
                style={{
                  fontSize: '20px',
                }}
              />
              <div className={quantity}>
                {Array.isArray(compareItems) ? compareItems.length : 0}
              </div>
            </div>
            <div className={boxCart} onClick={() => handleOpenSideBar('wishlist')} style={{ cursor: 'pointer' }}>
              <BsHeart
                style={{
                  fontSize: '20px',
                }}
              />
              <div className={quantity}>
                {Array.isArray(wishlistItems) ? wishlistItems.length : 0}
              </div>
            </div>
            <div className={boxCart}>
              <PiShoppingCart
                style={{
                  fontSize: '25px',
                }}
                onClick={() => handleOpenCartSideBar()}
              />

              <div className={quantity}>
                {totalItemCart || userInfo?.amountCart || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyHeader;
