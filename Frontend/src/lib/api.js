
import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: `${import.meta.env.VITE_BACKEND_BASEURL}/api`,
=======
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api",
>>>>>>> 2b64cadba04286aafacfde64e93575934ff6c993
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("researchConnectToken");

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

export default api;