import _ from "lodash";
import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import styles from "./styles.module.scss";

function QrcodeRead({ setDataLogin }) {
    const [data, setData] = useState("No result");
    const [facingMode, setFacingMode] = useState("environment");

    const toggleCamera = () => {
        setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    };

    return (
        <div className={styles.qrCodeReader}>
            <Scanner
                onScan={(results) => {
                    if (results && results.length > 0) {
                        const result = results[0];
                        const rawValue = result.rawValue;

                        if (rawValue) {
                            const newResult = rawValue.split("&&");
                            const loginData = {
                                name: decodeURI(newResult[0]),
                                password: decodeURI(newResult[1]),
                                isQrCode: true,
                            };
                            setData(loginData);
                            setDataLogin(loginData);
                        }
                    }
                }}
                onError={(error) => console.log("Scanner error:", error?.message)}
                formats={["qr_code"]}
                constraints={{
                    facingMode: facingMode,
                }}
                scanDelay={300}
            />
            <button onClick={toggleCamera} className={styles.cameraToggle}>
                Trocar Câmera ({facingMode === "user" ? "Frontal" : "Traseira"})
            </button>
            <p>{typeof data === 'object' ? data.name : data}</p>
        </div>
    );
};

export default QrcodeRead;