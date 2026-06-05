
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASEURL}/api`,
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