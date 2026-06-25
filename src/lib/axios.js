import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://sablo-application.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// می‌توانی اینجا Interceptor اضافه کنی تا توکن را خودکار به همه درخواست‌ها بچسباند
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;