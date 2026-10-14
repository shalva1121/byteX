export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  message?: string;
  [key: string]: unknown;
}
