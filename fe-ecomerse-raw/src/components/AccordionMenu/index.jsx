import { useState } from 'react';
import styles from './styles.module.scss';
import cls from 'classnames';
import { RiArrowDownWideLine } from 'react-icons/ri';
import { TfiLayoutLineSolid } from 'react-icons/tfi';

function AccordionMenu({ titleMenu, contentJsx, onClick, isSelected }) {
    const {
        container,
        title,
        activeTitle,
        contentMenu,
        isVisibility,
        borderBottom
    } = styles;

    const handleToggle = () => {
        onClick();
    };

    return (
        <div className={container}>
            <div
                className={cls(title, {
                    [activeTitle]: isSelected
                })}
                onClick={handleToggle}
            >
                {isSelected ? (
                    <TfiLayoutLineSolid style={{ fontSize: '20px' }} />
                ) : (
                    <RiArrowDownWideLine style={{ fontSize: '20px' }} />
                )}{' '}
                {titleMenu}
            </div>

            <div
                className={cls(contentMenu, borderBottom, {
                    [isVisibility]: isSelected
                })}
            >
                {contentJsx}
            </div>
        </div>
    );
}

export default AccordionMenu;
