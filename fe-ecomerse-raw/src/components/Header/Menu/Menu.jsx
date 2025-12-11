import { useContext } from 'react';
import styles from '../styles.module.scss';
import { SideBarContext } from '@/contexts/SideBarProvider';
import { StoreContext } from '@/contexts/storeProvider';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Menu({ content, href }) {
  const { menu, subMenu } = styles;
  const { setIsOpen, setType } = useContext(SideBarContext);
  const { userInfo, handleLogOut } = useContext(StoreContext);
  const [isShowSubMenu, setIsShowSubMenu] = useState(false);
  const navigate = useNavigate();

  const handleClickShowLogin = () => {
    if (content === 'Sign in') {
      if (!userInfo) {
        setIsOpen(true);
        setType('login');
      } else {
        setIsShowSubMenu((v) => !v);
      }
      return;
    }
    navigate(href);
  };

  const handleRenderText = (content) => {
    if (content === 'Sign in' && userInfo) {
      return userInfo?.name || userInfo?.username || 'Member';
    }
    return content;
  };

  const handleHover = () => {
    if (content === 'Sign in' && userInfo) setIsShowSubMenu(true);
  };

  return (
    <div
      className={menu}
      onMouseEnter={handleHover}
      onClick={handleClickShowLogin}
    >
      {handleRenderText(content)}

      {isShowSubMenu && (
        <div
          onMouseLeave={() => setIsShowSubMenu(false)}
          className={subMenu}
          style={{ minWidth: 200 }}
        >
          <div style={{ padding: '10px 12px', fontWeight: 600 }}>Member</div>
          <div style={{ height: 1, background: '#eee' }} />
          <div style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => { setIsShowSubMenu(false); navigate('/about-us') }}>Cài đặt</div>
          <div style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => { setIsShowSubMenu(false); navigate('/order') }}>Lịch sử giao dịch</div>
          <div style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => { setIsShowSubMenu(false); handleLogOut() }}>Đăng xuất</div>
        </div>
      )}
    </div>
  );
}

export default Menu;
