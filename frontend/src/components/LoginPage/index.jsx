import React, { useState } from "react";
import { Row, Col, Container } from "reactstrap";
import LoginForm from "../LoginForm";
import QrRead from "../QrcodeRead";
import styles from "./styles.module.scss";

const HomePage = () => {
  const [showQRCode, setQrCode] = useState(false);
  const [dataQrCode, setDataQrCode] = useState({});

  return (
    <Container className={`${styles.homePage} ${showQRCode ? styles.showQR : ''}`}>
      <Row className={`${styles.row} align-items-center`}>
        <Col md={7} lg={8} className={styles.leftCol}>
          <LoginForm role="user" data={dataQrCode} />
          {showQRCode && <QrRead setDataLogin={setDataQrCode} />}
          <button
            className={styles['form__submit']}
            onClick={() => setQrCode(!showQRCode)}
          >
            Login with QR Code
          </button>
          <a href="/forgotpassword" className={styles.forgotPasswordLink}>Esqueci a password</a>
          <a href="/register" className={styles.forgotPasswordLink}>Não tens conta? Regista-te</a>
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

export default HomePage;
