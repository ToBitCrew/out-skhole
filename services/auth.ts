import type {
  LoginResponse,
  RegisterResponse,
  RefreshResponse,
  OtpVerifyResponse,
} from "@/types/api";
import api, { parseRefreshTokenFromHeaders } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function login(body: {
  contact: string;
  password: string;
  device: string;
  location?: string;
}) {
  const res = await api.post<{ success: true; data: LoginResponse }>(
    "/auth/login",
    body
  );
  const rt = parseRefreshTokenFromHeaders(res.headers as Record<string, string | string[] | undefined>);
  if (rt) await AsyncStorage.setItem("refreshToken", rt);
  return res.data.data;
}

export async function register(body: {
  handle_nm: string;
  nick_nm: string;
  password: string;
  email: string;
  school_cd: string;
  dept_cd: string;
}) {
  const { data } = await api.post<{ success: true; data: RegisterResponse }>(
    "/auth/register",
    body
  );
  return data.data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function refresh() {
  const { data } = await api.post<{ success: true; data: RefreshResponse }>(
    "/auth/refresh"
  );
  return data.data;
}

export async function sendOtp(body: {
  email: string;
  purpose: "register" | "school" | "find_account";
}) {
  await api.post("/auth/otp/send", body);
}

export async function verifyOtp(body: {
  email: string;
  otp: string;
  purpose: "register" | "school" | "find_account";
}) {
  const { data } = await api.post<{ success: true; data: OtpVerifyResponse }>(
    "/auth/otp/verify",
    body
  );
  return data.data;
}

export async function verifySchool(body: {
  school_mail: string;
  email_verify_token: string;
  school_cd: string;
  department: string;
  school_major_id: number;
  grade: number;
}) {
  await api.post("/auth/school/verify", body);
}

export async function verifyIdentity(body: { verify_token: string }) {
  await api.post("/auth/identity/verify", body);
}
