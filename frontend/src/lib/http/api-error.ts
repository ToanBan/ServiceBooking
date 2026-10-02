import axios from "axios";
import type { ApiErrorBody, FieldErrors } from "@/types/api";


function normalizeFieldErrors(errors: FieldErrors | undefined): FieldErrors {
  if (!errors) return {};

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      value,
    ]),
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
    readonly fieldErrors: FieldErrors = {},
    readonly isNetworkError = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!axios.isAxiosError(error)) {
    return new ApiError("Đã có lỗi không xác định xảy ra.");
  }

  if (error.code === "ECONNABORTED") {
    return new ApiError(
      "Yêu cầu quá thời gian. Vui lòng thử lại.",
      null,
      {},
      true,
    );
  }

  if (!error.response) {
    return new ApiError(
      "Không thể kết nối tới máy chủ. Hãy kiểm tra backend đã chạy chưa?",
      null,
      {},
      true,
    );
  }

  const data = error.response.data as ApiErrorBody | undefined;

  const message =
    data?.message ??
    (data?.errors
      ? "Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường đã nhập."
      : "Yêu cầu thất bại.");

  return new ApiError(
    message,
    error.response.status,
    normalizeFieldErrors(data?.errors),
  );
}
