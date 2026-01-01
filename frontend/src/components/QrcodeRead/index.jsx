import _ from "lodash";
import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import styles from "./styles.module.scss";

function QrcodeRead({ setDataLogin }) {
    const [data, setData] = useState("no Result");
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

                    const newResult = scanned.rawValue.split("&&");

                    const data = {
                        name: newResult[0],
                        password: newResult[1],
                        isQrCode: true,
                    };

                    setData(data);
                    setDataLogin(data);
                }}
                onError={(error) => { }}
                constraints={{ facingMode }}
                scanDelay={300}
            />
            <button onClick={toggleCamera} className={styles.cameraToggle}>
                Trocar Câmera ({facingMode === "user" ? "Frontal" : "Traseira"})
            </button>
            <p>{data.name}</p>
        </div>
    );
};

export default QrcodeRead;