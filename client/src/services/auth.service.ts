import axios from "axios";
import api from "./api";
import type {
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  ResetPasswordData,
  ResetPasswordResponse,
} from "../types/auth-props";

export async function loginUser(data: LoginData) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data.data;
}

export async function registerUser(data: RegisterData) {
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data.data;
}

export async function forgotPassword(email: string) {
  const response = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    { email },
  );

  return response.data;
}

export async function resetPassword(data: ResetPasswordData) {
  const response = await api.post<ResetPasswordResponse>(
    "/auth/reset-password",
    data,
  );

  return response.data;
}

export async function logoutUser() {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/logout`,
    {},
    {
      withCredentials: true,
    },
  );
}
