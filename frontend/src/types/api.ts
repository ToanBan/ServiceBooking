export type FieldErrors = Record<string, string[]>;

export interface ApiErrorBody {
  message?: string;
  title?: string;
  errors?: FieldErrors;
}
