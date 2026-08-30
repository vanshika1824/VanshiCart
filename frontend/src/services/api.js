import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vanshicart_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiError = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.detail
    ? (Array.isArray(error.response.data.detail)
        ? error.response.data.detail.map((x) => x.msg).join(", ")
        : error.response.data.detail)
    : fallback;

export default api;