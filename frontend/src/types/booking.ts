export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface BookingItem {
  id: number;
  bookingCode: string;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  customerNote: string | null;
  cancellationReason: string | null;
}

export interface BookingPage {
  items: BookingItem[];
  totalCount: number;
  offset: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BookingPayload {
  serviceId: number;
  staffId: number;
  date: string;
  startTime: string;
  customerNote?: string | null;
}