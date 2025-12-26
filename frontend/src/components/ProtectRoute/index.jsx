import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { isValidLogin, isFetching, hasLogin, user } = useAuth();

  useEffect(() => {
    hasLogin();
  }, [])

  if (isFetching) {
    return <div>Loading...</div>
  }

  if (!isValidLogin) {
   
    return <Navigate to="/" />;
  }

 
  if (role) {

    const userScopes = user || [];
    const hasRole = Array.isArray(userScopes)
      ? userScopes.includes(role)
      : userScopes === role;

    if (!hasRole) {
     
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;