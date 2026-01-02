import React, { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import styles from "./styles.module.scss";
import { buildApiUrl } from "../../utils/api";

function QrcodeRead({ setDataLogin }) {
    const [status, setStatus] = useState("A aguardar QR code...");
    const [facingMode, setFacingMode] = useState("environment");

    useEffect(() => {
    }, []);

    const toggleCamera = () => {
        setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    };

    const handleQRLogin = async (userId) => {
        try {
            setStatus("A fazer login...");

            const response = await fetch(buildApiUrl('/api/auth/login-qr'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                const data = await response.json();
                setStatus("Login com sucesso!");
                setDataLogin({ success: true, userId });
                window.dispatchEvent(new Event('auth-change'));
                window.location.href = '/';
            } else {
                const error = await response.json();
                setStatus("Erro: " + (error.message || "Login falhou"));
            }
        } catch (err) {
            setStatus("Erro de conexão");
        }
    };

    return (
        <div className={styles.qrCodeReader}>
            <Scanner
                onScan={(results) => {
                    if (results && results.length > 0) {
                        const rawValue = results[0].rawValue;

                        if (rawValue && rawValue.startsWith("QRLOGIN:")) {
                            const userId = rawValue.replace("QRLOGIN:", "");
                            handleQRLogin(userId);
                        }
                    }
                }}
                onError={(error) => {
                }}
                constraints={{
                    facingMode: facingMode,
                }}

                scanDelay={100}
            />
            <button onClick={toggleCamera} className={styles.cameraToggle}>
                Trocar Câmera ({facingMode === "user" ? "Frontal" : "Traseira"})
            </button>
            <p>{status}</p>
        </div>
    );
};

export default QrcodeRead;