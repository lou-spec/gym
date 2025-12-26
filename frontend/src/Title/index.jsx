import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

export const Title = ({ isSecondary = false, text = ''}) => {
    return (
        <h1 className={classnames(styles.text, { [styles.secondary]: isSecondary })}>{text}</h1>
    );
}    