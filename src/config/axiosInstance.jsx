"use client";

import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// Dynamic request interceptor to always send token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = CookieManager.get("sec-prd-token") || localStorage.getItem("sec-prd-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      CookieManager.remove("sec-prd-token");
      try { localStorage.removeItem("sec-prd-token"); } catch(e) {}
      delete axiosInstance.defaults.headers.common.Authorization;

      // Don't redirect if we're already on the login page or auth pages
      if (!window.location.pathname.startsWith("/auth") && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions
export const setAuthToken = (token, keepMeLoggedIn = false) => {
  const expires = keepMeLoggedIn ? 1 : 1 / 24; // 1 day if Remember Me checked, 1 hour (1/24 day) standard
  CookieManager.set("sec-prd-token", token, {
    expires,
    path: "/",
    secure: true,
    sameSite: "Strict",
  });
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  CookieManager.remove("sec-prd-token");
  delete axiosInstance.defaults.headers.common.Authorization;
};

export const getAuthToken = () => {
  return CookieManager.get("sec-prd-token");
};

export default axiosInstance;
