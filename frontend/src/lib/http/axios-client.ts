import axios, { type AxiosInstance } from "axios";
import { ENV } from "@/config/env";


export function createHttpClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    withCredentials: true,
    timeout: ENV.requestTimeout,
    headers: { "Content-Type": "application/json" },
  });
}
