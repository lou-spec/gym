import { useCallback, useEffect, useState } from "react";
import { buildApiUrl } from "../../../utils/api";

export const useGetData = (url = "", pageSize = 10, current = 1, sort = "", order = "") => {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [data, setData] = useState({
    users: [],
    games: [],
    clients: [],
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

    const query = `/api/${url}?` + queryParams.toString();

    setLoading(true);
    setError(false);

    fetch(buildApiUrl(query), {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((response) => {
        const { pagination, auth, games, users, clients } = response;

        if (!auth) {
          setError(true);
          return;
        }

        setData((prev) => ({
          ...prev,
          games: games ?? prev.games,
          users: users ?? prev.users,
          clients: clients ?? prev.clients,
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
  }, [url, pageSize, current, sort, order]);

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
