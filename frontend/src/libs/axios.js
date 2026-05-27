import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api",  // ← just this, no full URL
  withCredentials: true,
});