import { createContext } from "react";
import type { User } from "../types/auth";

export interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
