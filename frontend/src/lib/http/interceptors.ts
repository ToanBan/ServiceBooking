import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { toApiError } from "./api-error";
import { emitAuthFailure } from "./auth-events";
import { refreshAccessToken } from "./refresh-token";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };


const NO_REFRESH_ENDPOINTS: string[] = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.refreshToken,
];

export function attachInterceptors(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined;

      const shouldRefresh =
        typeof window !== "undefined" &&
        error.response?.status === 401 &&
        config != null &&
        !config._retry &&
        !NO_REFRESH_ENDPOINTS.some((url) => config.url?.includes(url));

      if (!shouldRefresh) {
        throw toApiError(error);
      }

      config._retry = true;

      try {
        await refreshAccessToken();
      } catch {
        emitAuthFailure();
        throw toApiError(error);
      }

      return client(config);
    },
  );
}
