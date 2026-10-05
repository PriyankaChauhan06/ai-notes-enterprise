export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  data: User;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
