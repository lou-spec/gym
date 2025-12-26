import React from "react";
import { Row, Col, Container } from "reactstrap";
import RegisterForm from "../RegisterForm";
import styles from "../LoginPage/styles.module.scss";

const RegisterPage = () => {
    return (
        <Container className={styles.homePage}>
            <Row className={`${styles.row} align-items-center`}>
                <Col md={7} lg={8} className={styles.leftCol}>
                    <RegisterForm />
                    <a href="/login" className={styles.forgotPasswordLink}>Já tens conta? Faz login</a>
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

export default RegisterPage;
