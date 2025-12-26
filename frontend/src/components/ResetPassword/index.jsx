import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import { Eye, EyeOff } from 'lucide-react';
import styles from "../LoginPage/styles.module.scss";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 6) return "A password deve ter pelo menos 6 caracteres.";
    if (!/[A-Z]/.test(pwd)) return "A password deve conter pelo menos uma letra maiúscula.";
    if (!/[a-z]/.test(pwd)) return "A password deve conter pelo menos uma letra minúscula.";
    if (!/[0-9]/.test(pwd)) return "A password deve conter pelo menos um número.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "A password deve conter pelo menos um símbolo.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Password atualizada com sucesso.");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(data.message || "Erro ao redefinir password.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles.homePage}>
      <Row className={`${styles.row} align-items-center`}>
        <Col md={7} lg={8} className={styles.leftCol}>
          <div className={styles.loginForm}>
            <h2 className={styles.form__title}>Redefinir Password</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles['form-control__label']} htmlFor="password">Nova Password:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles['form-control']}
                    placeholder="Introduz a nova password"
                    style={{ marginBottom: 0 }}
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
                <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Mín. 6 chars, maiúscula, minúscula, número e símbolo.
                </small>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles['form-control__label']} htmlFor="confirmPassword">Confirmar Password:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles['form-control']}
                    placeholder="Repete a password"
                    style={{ marginBottom: 0 }}
                  />
                  {showConfirmPassword ? (
                    <EyeOff
                      onClick={() => setShowConfirmPassword(false)}
                      style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
                    />
                  ) : (
                    <Eye
                      onClick={() => setShowConfirmPassword(true)}
                      style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
                    />
                  )}
                </div>
              </div>

              {error && <p className={styles.error_message}>{error}</p>}
              {message && <p style={{ color: "#dc2626", textAlign: "center", marginBottom: "16px" }}>{message}</p>}

              <button type="submit" className={styles['form__submit']} disabled={loading}>
                {loading ? "A processar..." : "Redefinir Password"}
              </button>

              <div className={styles.form__footer}>
                <a href="/login">Voltar ao Login</a>
              </div>
            </form>
          </div>
        </Col>

        <Col md={5} lg={4} className={styles.rightCol}>
          <div className={styles.form__animation}>
            <div id="ball" className={styles.ball}>
              <div className={styles.ball__eyes}>
                <div className={styles.eye_wrap}><span className={styles.eye}></span></div>
                <div className={styles.eye_wrap}><span className={styles.eye}></span></div>
              </div>
              <div className={styles.ball__mouth}></div>
              <div className={styles.ball__shadow}></div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
