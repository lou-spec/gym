import _ from "lodash";
import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import styles from "./styles.module.scss";

function QrcodeRead({ setDataLogin }) {
    const [data, setData] = useState("no Result");

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
                onError={(error) => {}}
                constraints={{ facingMode: "user" }}
                scanDelay={300}
            />
            <p>{data.name}</p>
        </div>
    );
};

export default QrcodeRead;