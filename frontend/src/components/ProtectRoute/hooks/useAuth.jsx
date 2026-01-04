import { useState } from "react";
import { buildApiUrl } from "../../../utils/api";

export const useAuth = () => {
    const [isValidLogin, setValidLogin] = useState(false);
    const [isFetching, setFeching] = useState(true);

    const [user, setUser] = useState(null);

    const hasLogin = () => {
        setFeching(true);
        fetch(buildApiUrl('/api/auth/me'), {
            headers: { 'Accept': 'application/json' },
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((response) => {
                setValidLogin(response.auth);
                setUser(response.decoded);
            })
            .catch(() => {
                setValidLogin(false);
                setUser(null);
            }).finally(() => {
                setFeching(false);
            })
    }



    return {
        isValidLogin,
        hasLogin,
        isFetching,
        user
    }
}