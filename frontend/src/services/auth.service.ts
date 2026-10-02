import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
} from "@/types/auth";


export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await http.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      payload,
    );
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await http.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      payload,
    );
    return data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await http.get<AuthUser>(API_ENDPOINTS.auth.me);
    return data;
  },

  async logout() {
    const { data } = await http.post<MessageResponse>(API_ENDPOINTS.auth.logout);
    return data;
  },
};
