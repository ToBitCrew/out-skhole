import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function parseRefreshTokenFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers["set-cookie"];
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
  for (const c of cookies) {
    const match = c.match(/refreshToken=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const rt = await AsyncStorage.getItem("refreshToken");
        if (!rt) throw new Error("No refresh token");
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { headers: { Cookie: `refreshToken=${rt}` } }
        );
        const newToken = data.data.accessToken;
        await AsyncStorage.setItem("accessToken", newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
