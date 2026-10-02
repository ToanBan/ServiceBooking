
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const signalRHubUrl =
  process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ?? "/hubs/bookings";

export const ENV = {
  apiBaseURL,
  signalRHubUrl,
  requestTimeout: 15_000,
  isDev: process.env.NODE_ENV === "development",
} as const;
