import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./styles.module.scss";
import titleImage from "../../logo.png";
import { useTheme } from "../../contexts/ThemeProvider/ThemeProvider";
import { showSwalSuccess } from "../../utils/swalTheme";
import { buildApiUrl } from "../../utils/api";

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {

    const checkAuth = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/auth/me'), {
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.auth && data.decoded) {
            setIsAuthenticated(true);
            const scopes = data.decoded.scope || data.decoded || [];

            if (scopes.includes('admin')) setUserRole('admin');
            else if (scopes.includes('trainer')) setUserRole('trainer');
            else if (scopes.includes('user')) setUserRole('user');
            else setUserRole(null);
          } else {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (e) {
        console.error("Error checking auth:", e);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();

    window.addEventListener('focus', checkAuth);
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch(buildApiUrl('/api/users/perfil'), {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();

    window.addEventListener('profile-update', fetchUserData);

    return () => {
      window.removeEventListener('profile-update', fetchUserData);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${isDarkMode ? styles.dark : ""}`}>

      <a href="/" className={styles.logoContainer}>
        <img src={titleImage} alt="FitLife" className={styles.logo} />
        <span className={styles.logoText}>FitLife</span>
      </a>


      <nav className={styles.nav}>
        <a
          href="/"
          className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
        >
          Home
        </a>
      </nav>

      <div className={styles.rightSection}>

        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
        </button>

        {isAuthenticated && userData && (
          <a href={
            userRole === 'admin' ? '/admin' :
              userRole === 'trainer' ? '/trainer' :
                '/user'
          } className={styles.profileLink}>
            <div className={styles.profileContainer}>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{userData.name}</span>
                <span className={styles.profileRole}>
                  {userRole === 'admin' ? 'ADMINISTRADOR' :
                    userRole === 'trainer' ? 'TREINADOR' :
                      'UTILIZADOR'}
                </span>
              </div>
              {userData.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt="Foto de perfil"
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.profileAvatar}>
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </a>
        )}

        {!isAuthenticated && (
          <a href="/login" className={styles.loginBtn}>
            Login
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;
