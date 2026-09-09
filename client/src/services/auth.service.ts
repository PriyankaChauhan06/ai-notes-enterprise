import api from "./api";
import type { LoginData, LoginResponse } from "../types/auth-props";

export async function loginUser(data: LoginData) {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data.data;
}
