import { useCallback, useEffect, useState } from "react";

export const useGetPerfil = (url = "users") => {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState({ data: {} });

  const fetchingData = useCallback(() => {
    // Sempre usa /api/users/perfil, independente do tipo de utilizador
    const querie = `/api/users/perfil`;
    setLoading(true);

    fetch(querie, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((response) => {
        const { user: userData = {} } = response;
        setUser({ data: userData });
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return {
    user,
    isError,
    isLoading,
    load: fetchingData,
  };
};
