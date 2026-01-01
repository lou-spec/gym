import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import styles from "./styles.module.scss";

function Qrcode({ user = { name: "", password: "" } }) {
    const [value, setValue] = useState("");

    useEffect(() => {
        const newWord = `${user.name}&&${user.password}`;
        setValue(newWord);
    }, [user]);

    return (
        <div className={styles.qrCodeCreate}>
            <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "250px", width: "250px" }}
                value={value}
                viewBox={'0 0 256 256'}
            />
        </div>
    );
};

export default Qrcode;