import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/ProtectRoute/hooks/useAuth";

export const useRedirectIfAuthenticated = () => {
    const { isValidLogin, isFetching, user, hasLogin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        hasLogin();
    }, []);

    useEffect(() => {
        if (!isFetching && isValidLogin && user) {
            const userScopes = user || [];

            if (Array.isArray(userScopes)) {
                if (userScopes.includes('admin')) {
                    navigate('/admin', { replace: true });
                } else if (userScopes.includes('trainer')) {
                    navigate('/trainer', { replace: true });
                } else if (userScopes.includes('user')) {
                    navigate('/user', { replace: true });
                }
            }
        }
    }, [isValidLogin, isFetching, user, navigate]);

    return { isFetching };
};
