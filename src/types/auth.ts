export interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  photo?: string;
  cover?: string;
  dateOfBirth?: string;
  gender?: "male" | "female";
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  data?: {
    token?: string;
    user?: User;
  };
}

export interface ProfileResponse {
  message: string;
  user?: User;
  data?: {
    user?: User;
  };
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  token?: string;
  user?: User;
  data?: T;
  errors?: string | string[];
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  dateOfBirth: string;
  gender: "male" | "female" | "";
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
}
