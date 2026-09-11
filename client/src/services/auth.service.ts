import axios from "axios";
import api from "./api";
import type { LoginData, LoginResponse, User } from "../types/auth-props";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  data: User;
}

export async function loginUser(data: LoginData) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data.data;
}

export async function registerUser(data: RegisterData) {
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data.data;
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
