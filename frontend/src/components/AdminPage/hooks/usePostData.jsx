import { useState } from "react";

export const usePostData = (url = "") => {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState({});

  // 🔹 Função adicional no mesmo estilo da imagem
  const addData = (data) => {
    setLoading(true);
    fetch(`/api/${url}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao enviar dados");
        return r.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  // 🔹 Função original, com suporte a FormData e fetch async
  const postData = async (payload) => {
    setLoading(true);
    setError(false);

    try {
      const isFormData = payload instanceof FormData;

      const response = await fetch(`/api/${url}`, {
        method: "POST",
        credentials: "include",
        headers: isFormData
          ? undefined
          : { "Content-Type": "application/json" },
        body: isFormData ? payload : JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao enviar dados");

      const result = await response.json();
      setData(result);
      return result;
    } catch (error) {
      console.error("Error:", error);
      setError(true);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    isError,
    isLoading,
    postData,
    addData, // 🔹 exportamos também a nova função
  };
};
