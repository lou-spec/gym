import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import styles from "../LoginPage/styles.module.scss";
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ title, role, data }) => {
  const { register, handleSubmit } = useForm();
  const [isLogged, setLogged] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const passwordRef = useRef(null);
  const ballRef = useRef(null);

  const onSubmit = (formData) => login(formData);

  const login = (formData) => {
    setLoginError("");
    fetch("/api/auth/login", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ ...formData, rememberMe }),
    })
      .then((r) => {
        if (!r.ok) {

          return r.json().then(err => { throw err; });
        }
        return r.json();
      })
      .then((response) => {
        if (response.auth) {
          try {
            const token = response.token;
            let payload = {};
            if (token) {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              payload = JSON.parse(window.atob(base64));
            }

            const userScopes = payload.scope || [];
            const isAdminUser = Array.isArray(userScopes) ? userScopes.includes('admin') : userScopes === 'admin';

            if (role === 'admin' && !isAdminUser) {
              setLoginError('Acesso negado: precisa de permissões de administrador.');
              return;
            }

            setUserToken(token);
            setLogged(true);
            window.dispatchEvent(new Event('auth-change'));
          } catch (err) {
            console.error('Erro ao validar token', err);
            setLoginError('Erro ao validar credenciais.');
          }
        } else {
          setLoginError("Login falhou. Verifique as credenciais.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);

        let msg = error.message;
        if (msg === "This data is wrong" || msg === "User not valid") {
          msg = "Credenciais inválidas.";
        }
        setLoginError(msg || "Email ou palavra-passe incorretos.");
      });
  };


  useEffect(() => {
    if (data && Object.keys(data).length) login(data);
  }, [data]);

  useEffect(() => {
    const handleMouseMove = (e) => {

      if (!passwordRef.current || !ballRef.current) return;

      if (document.activeElement !== passwordRef.current) {
        const eyes = ballRef.current.querySelectorAll(".eye");
        eyes.forEach((eye) => {
          const rect = eye.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          const rad = Math.atan2(e.pageX - x, e.pageY - y);
          const rot = (rad * (180 / Math.PI) * -1) + 180;
          eye.style.transform = `rotate(${rot}deg)`;
        });
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleFocusPassword = () => {
    if (ballRef.current) {
      ballRef.current.style.transform = "translateX(30px)";
      ballRef.current.querySelectorAll(".eye").forEach((eye) => eye.style.transform = "rotate(100deg)");
    }
  };

  const handleFocusOutPassword = (e) => {
    if (ballRef.current) {
      ballRef.current.style.transform = "translateX(0)";
      if (!e.target.checkValidity()) {
        ballRef.current.classList.add("sad");
      } else {
        ballRef.current.classList.remove("sad");
      }
    }
  };

  if (isLogged) {

    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      try {
        if (userToken) {
          const base64Url = userToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          const userScopes = payload.scope || [];
          const isTrainer = Array.isArray(userScopes) ? userScopes.includes('trainer') : userScopes === 'trainer';
          const isAdmin = Array.isArray(userScopes) ? userScopes.includes('admin') : userScopes === 'admin';

          if (isAdmin) return <Navigate to="/admin" replace />;
          if (isTrainer) return <Navigate to="/trainer" replace />;
          return <Navigate to="/user" replace />;
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
      return <Navigate to="/user" replace />;
    }
  }

  return (
    <div className={styles.loginForm}>
      <h2 className={styles.form__title}>{title}</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.inputGroup}>
          <label className={styles['form-control__label']} htmlFor="name">Nome / Email:</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            {...register("name")}
            className={styles['form-control']}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles['form-control__label']} htmlFor="password">Palavra-passe:</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              {...register("password")}
              className={styles['form-control']}
              style={{ marginBottom: 0 }}
              onFocus={handleFocusPassword}
              onBlur={handleFocusOutPassword}
              ref={(e) => {
                register("password").ref(e);
                passwordRef.current = e;
              }}
            />
            {showPassword ? (
              <EyeOff
                onClick={() => setShowPassword(false)}
                style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
              />
            ) : (
              <Eye
                onClick={() => setShowPassword(true)}
                style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px', accentColor: '#dc2626' }}
          />
          <label htmlFor="rememberMe" style={{ cursor: 'pointer', color: 'var(--form-text)', fontSize: '0.9rem' }}>Lembrar-me</label>
        </div>

        {loginError && (
          <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>
            {loginError}
          </div>
        )}

        <button type="submit" className={styles['form__submit']}>Entrar</button>
      </form>
    </div>
  );
};

export default LoginForm;
