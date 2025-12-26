import { useCallback, useEffect, useState } from "react";

export const useGetData = (url = "", pageSize = 10, current = 1, sort = "", order = "", filters = {}) => {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [data, setData] = useState({
    users: [],
    clients: [],
    sessions: [],
    packages: [],
    games: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const fetchingData = useCallback(() => {
    let queryParams = new URLSearchParams({
      limit: pageSize,
      skip: (current - 1) * pageSize,
    });

    if (sort) queryParams.append('sortBy', sort);
    if (order) queryParams.append('sortOrder', order);

    // Append filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const query = `/api/${url}?` + queryParams.toString();

    setLoading(true);
    setError(false);

    fetch(query, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((response) => {
        const { pagination, auth, clients, sessions, users, packages, games } = response;

        if (!auth) {
          setError(true);
          return;
        }

        setData((prev) => ({
          ...prev,
          clients: clients ?? users ?? prev.clients,
          users: users ?? prev.users,
          sessions: sessions ?? prev.sessions,
          packages: packages ?? prev.packages,
          games: games ?? prev.games,
          pagination: {
            current: current || 1,
            pageSize: pagination?.pageSize || 10,
            total: pagination?.total || 0,
          },
        }));
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [url, pageSize, current, sort, order, JSON.stringify(filters)]);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return {
    data,
    isError,
    isLoading,
    load: fetchingData,
  };
};
