import { ENV } from "@/config/env";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { createHttpClient } from "./axios-client";


const plainClient = createHttpClient(ENV.apiBaseURL);

let inFlight: Promise<void> | null = null;


export function refreshAccessToken(): Promise<void> {
  inFlight ??= plainClient
    .post(API_ENDPOINTS.auth.refreshToken)
    .then(() => undefined)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
