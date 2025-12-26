import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import styles from "../LoginPage/styles.module.scss";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateEmail(email)) {
      setError("Por favor, introduz um email válido.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Email de recuperação enviado com sucesso! Verifica o teu email.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Erro ao enviar email de recuperação");
      }
    } catch (err) {
      setError("Erro de conexão. Tenta novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles.homePage}>
      <Row className={`${styles.row} align-items-center`}>
        <Col md={7} lg={8} className={styles.leftCol}>
          <div className={styles.loginForm}>
            <h2 className={styles.form__title}>Recuperar Password</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div>
                <label className={styles['form-control__label']} htmlFor="email">
                  Email:
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles['form-control']}
                  placeholder="Introduz o teu email"
                />
              </div>

              {error && <p className={styles.error_message}>{error}</p>}
              {message && <p style={{ color: "#dc2626", textAlign: "center", marginBottom: "16px" }}>{message}</p>}

              <button type="submit" className={styles['form__submit']} disabled={loading}>
                {loading ? "Enviando..." : "Enviar Email de Recuperação"}
              </button>

              <div className={styles.forgotPasswordLink}>
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

export default ForgotPassword;
