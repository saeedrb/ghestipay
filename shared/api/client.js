import axios from "axios";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
});

// Request interceptor
client.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.skipAuthRedirect) {
      Cookies.remove("token");
      window.location.href = "/";
    }

    return Promise.reject(err);
  }
);

export default client;
