import _ from "lodash";
import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import styles from "./styles.module.scss";

function QrcodeRead({ setDataLogin }) {
    const [data, setData] = useState(null);
    const [facingMode, setFacingMode] = useState("user");

    const toggleCamera = () => {
        setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    };

    return (
        <div className={styles.qrCodeReader}>
            <Scanner
                onScan={(results) => {
                    if (!results || results.length === 0) return;

                    const scanned = results[0];
                    const rawValue = scanned.rawValue;

                    console.log('QR Code lido:', rawValue);

                    if (!rawValue.includes('&&')) {
                        console.error('QR Code inválido: não contém &&');
                        return;
                    }

                    const newResult = rawValue.split("&&");

                    if (newResult.length !== 2) {
                        console.error('QR Code inválido: formato incorreto');
                        return;
                    }

                    const loginData = {
                        name: newResult[0],
                        password: newResult[1],
                        isQrCode: true,
                    };

                    console.log('Dados de login extraídos:', { name: loginData.name, hasPassword: !!loginData.password });

                    setData(loginData);
                    setDataLogin(loginData);
                }}
                onError={(error) => {
                    console.error('Erro no scanner:', error);
                }}
                constraints={{
                    facingMode,
                    aspectRatio: 1,
                }}
                scanDelay={500}
                components={{
                    audio: false,
                    onOff: false,
                    torch: false,
                    zoom: false,
                    finder: true,
                }}
                styles={{
                    container: { width: '100%', maxWidth: '400px' }
                }}
            />
            <button onClick={toggleCamera} className={styles.cameraToggle}>
                Trocar Câmera ({facingMode === "user" ? "Frontal" : "Traseira"})
            </button>
            {data && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>✓ Utilizador: {data.name}</p>}
            {!data && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Aponta a câmera para o QR code</p>}
        </div>
    );
};

export default QrcodeRead;