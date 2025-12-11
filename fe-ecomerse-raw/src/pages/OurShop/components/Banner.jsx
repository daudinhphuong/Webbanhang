import CountdownTimer from '@components/CountdownTimer/CountdownTimer';
import styles from '../styles.module.scss';
import Button from '@components/Button/Button';

function Banner({ titleText = 'The Classics Make A Comeback', buttonText = 'Buy Now' }) {
    const { containerBanner, contentBox, title, boxBtn, countDownBox } = styles;
    const targetDate = '2025-12-31T00:00:00';

    return (
        <>
            <div className={containerBanner}>
                <div className={contentBox}>
                    <div className={countDownBox}>
                        <CountdownTimer targetDate={targetDate} />
                    </div>
                    <div className={title}>{titleText}</div>

                    <div className={boxBtn}>
                        <Button content={buttonText} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Banner;
