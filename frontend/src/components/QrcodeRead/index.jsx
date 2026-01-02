import React, { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import styles from "./styles.module.scss";
import { buildApiUrl } from "../../utils/api";
import { Camera, CameraOff, RefreshCw } from "lucide-react";

function QrcodeRead({ setDataLogin }) {
    const [status, setStatus] = useState("Aponte a câmara para o QR Code");
    const [facingMode, setFacingMode] = useState("environment");
    const [statusType, setStatusType] = useState("normal"); // normal, success, error

    useEffect(() => {
    }, []);

    const toggleCamera = () => {
        setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    };

    const handleQRLogin = async (userId) => {
        try {
            setStatus("A iniciar sessão...");
            setStatusType("normal");

            const response = await fetch(buildApiUrl('/api/auth/login-qr'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                const data = await response.json();
                setStatus("Sessão iniciada com sucesso!");
                setStatusType("success");
                setDataLogin({ success: true, userId });
                window.dispatchEvent(new Event('auth-change'));
                window.location.href = '/';
            } else {
                const error = await response.json();
                setStatus("Falha na autenticação: " + (error.message || "Tente novamente"));
                setStatusType("error");
            }
        } catch (err) {
            setStatus("Erro de conexão");
            setStatusType("error");
        }
    };

    return (
        <div className={styles.qrCodeContainer}>
            <div className={styles.scannerWrapper}>
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
                    scanDelay={500}
                    components={{
                        audio: false,
                        onOff: false,
                        torch: false,
                        zoom: false,
                        finder: false
                    }}
                    styles={{
                        container: { width: '100%', height: '100%' },
                        video: { width: '100%', height: '100%', objectFit: 'cover' }
                    }}
                />
            </div>

            <p className={styles.statusText}>
                {status}
            </p>

            <button onClick={toggleCamera} className={styles.cameraToggle}>
                <RefreshCw />
                Trocar Câmara ({facingMode === "user" ? "Frontal" : "Traseira"})
            </button>
        </div>
    );
};

export default QrcodeRead;