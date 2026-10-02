import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";
import type {
  AvailableSlot,
  BookingPage,
  BookingPayload,
  BookingStatus,
} from "@/types/booking";

export const bookingApi = {
  async getAvailableSlots(params: {
    serviceId: number;
    staffId: number;
    date: string;
  }) {
    const { data } = await http.get<AvailableSlot[]>(
      API_ENDPOINTS.bookings.availableSlots,
      { params },
    );
    return data;
  },

  async create(payload: BookingPayload) {
    const { data } = await http.post(
      API_ENDPOINTS.bookings.create,
      payload,
    );
    return data;
  },

  async list(params: {
    page?: number;
    status?: BookingStatus;
    search?: string;
    date?: string;
  }) {
    const { data } = await http.get<BookingPage>(API_ENDPOINTS.bookings.list, {
      params,
    });
    return data;
  },

  async myBookings(params: {
    page?: number;
    status?: BookingStatus;
    date?: string;
  }) {
    const { data } = await http.get<BookingPage>(
      API_ENDPOINTS.bookings.myBookings,
      { params },
    );
    return data;
  },

  async updateStatus(id: number, status: BookingStatus) {
    const { data } = await http.patch(
      API_ENDPOINTS.bookings.updateStatus(id),
      { status },
    );
    return data;
  },

  async cancel(id: number, reason: string) {
    const { data } = await http.post(
      API_ENDPOINTS.bookings.cancel(id),
      { reason },
    );
    return data;
  },
};