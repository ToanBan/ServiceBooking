import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";
import type {
  StaffPage,
  WorkScheduleItem,
  WorkSchedulePayload,
} from "@/types/staff";

export const staffApi = {
  async list(params?: {
    isActive?: boolean;
    page?: number;
  }) {
    const { data } = await http.get<StaffPage>(API_ENDPOINTS.staffs.list, {
      params,
    });
    return data;
  },

  async getSchedules(
    staffId: number,
    params?: { from?: string; to?: string },
  ) {
    const { data } = await http.get<WorkScheduleItem[]>(
      API_ENDPOINTS.staffs.schedules(staffId),
      { params },
    );
    return data;
  },

  async createSchedule(staffId: number, payload: WorkSchedulePayload) {
    const { data } = await http.post<WorkScheduleItem>(
      API_ENDPOINTS.staffs.schedules(staffId),
      payload,
    );
    return data;
  },
};