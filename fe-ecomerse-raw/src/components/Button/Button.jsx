import styles from './styles.module.scss';
import classNames from 'classnames';

function Button({
    content,
    isPriamry = true,
    customClassname = false,
    ...props
}) {
    const { btn, primaryBtn, secondaryBtn } = styles;
    return (
        <button
            className={classNames(btn, {
                [primaryBtn]: isPriamry,
                [secondaryBtn]: !isPriamry,
                [customClassname]: customClassname
            })}
            {...props}
        >
            {content}
        </button>
    );
}

export default Button;
