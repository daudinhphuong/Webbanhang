import { dataMenu } from '@components/Footer/constant';
import styles from './styles.module.scss';
import { useSettings } from '@/contexts/SettingsProvider';

function MyFooter() {
    const { container, boxNav } = styles;
    const { settings, loading } = useSettings();

    const logoUrl = settings?.logo || 'https://tse1.mm.bing.net/th/id/OIP.ry7eBCxsh1BiwR2GueQveQHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';
    const shopName = settings?.shopName || 'TechStore';
    const currentYear = new Date().getFullYear();

    return (
        <div className={container}>
            <div>
                {logoUrl && (
                    <img
                        src={logoUrl}
                        alt={shopName}
                        width={160}
                        height={55}
                        style={{ objectFit: 'contain' }}
                    />
                )}
                {!logoUrl && !loading && (
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                        {shopName}
                    </h3>
                )}
            </div>

            <div className={boxNav}>
                {dataMenu.map((item, idx) => (
                    <div key={`footer-menu-${idx}-${item.content}`}>{item.content}</div>
                ))}
            </div>

            <div>
                <p
                    style={{
                        textAlign: 'center'
                    }}
                >
                    Thanh toán an toàn được đảm bảo
                </p>
                <img
                    src='https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/elementor/thumbs/Icons-123-pzks3go5g30b2zz95xno9hgdw0h3o8xu97fbaqhtb6.png'
                    alt=''
                />
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ margin: '5px 0' }}>
                    Bản quyền © {currentYear} {shopName}. Mọi quyền được bảo lưu.
                </p>
                {settings?.address && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        {settings.address}
                        {settings.city && `, ${settings.city}`}
                        {settings.country && `, ${settings.country}`}
                    </p>
                )}
                {settings?.phone && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        Điện thoại: {settings.phone}
                    </p>
                )}
                {settings?.contactEmail && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        Email: {settings.contactEmail}
                    </p>
                )}
            </div>
        </div>
    );
}

export default MyFooter;
