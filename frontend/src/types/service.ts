export interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  offset: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ServicePayload {
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}
