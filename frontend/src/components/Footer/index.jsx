import React from 'react';
import styles from './styles.module.scss';
import { useTheme } from '../../contexts/ThemeProvider/ThemeProvider';
import { Instagram, Facebook, Twitter, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const { isDarkMode } = useTheme();

    return (
        <footer className={`${styles.footer} ${isDarkMode ? styles.darkMode : ''}`}>
            <div className={styles.container}>
                <div className={styles.grid}>

                    <div className={styles.brandColumn}>
                        <div className={styles.footerLogo}>
                            <span className={styles.footerText}>FitLife</span>
                        </div>
                        <p className={styles.brandDesc}>
                            Transforma o teu corpo, eleva a tua mente. O ginásio premium feito para os teus objetivos.
                        </p>
                    </div>




                    <div className={styles.column}>
                        <h4 className={styles.heading}>Contactos</h4>
                        <ul className={styles.contactList}>
                            <li>
                                <MapPin size={16} />
                                <span>Felgueiras,Portugal</span>
                            </li>
                            <li>
                                <Mail size={16} />
                                <span>info@fitlife.pt</span>
                            </li>
                            <li>
                                <Phone size={16} />
                                <span>+351 123 456 789</span>
                            </li>
                        </ul>
                    </div>


                    <div className={styles.column}>
                        <h4 className={styles.heading}>Segue-nos</h4>
                        <div className={styles.socials}>
                            <a href="#" className={styles.socialIcon}><Instagram size={20} /></a>
                            <a href="#" className={styles.socialIcon}><Facebook size={20} /></a>
                            <a href="#" className={styles.socialIcon}><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p className={styles.footerCopyright}>© 2025 FitLife Gym. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
