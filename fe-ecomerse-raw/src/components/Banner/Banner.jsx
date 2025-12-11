import Button from '../Button/Button';
import styles from './styles.module.scss';

function Banner() {
    const { container, content, title, des } = styles;
    return (
        <div className={container}>
            <div className={content}>
                <h1 className={title}>VNB store</h1>
                <div className={des}>
                    Làm cho những khoảnh khắc đặc biệt của bạn thêm ý nghĩa với những sản phẩm tuyệt vời.
                </div>

                <div
                    style={{
                        width: '172px'
                    }}
                >
                    <Button content={'Mua sắm ngay'} />
                </div>
            </div>
        </div>
    );
}

export default Banner;
