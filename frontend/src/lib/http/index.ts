import { ENV } from "@/config/env";
import { createHttpClient } from "./axios-client";
import { attachInterceptors } from "./interceptors";

export const http = createHttpClient(ENV.apiBaseURL);

attachInterceptors(http);

export { ApiError, toApiError } from "./api-error";
export { onAuthFailure } from "./auth-events";
