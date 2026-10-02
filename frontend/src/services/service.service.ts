import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type {
  PagedResponse,
  ServiceItem,
  ServicePayload,
} from "@/types/service";


export const serviceApi = {
  async list(params?: { page?: number }) {
    const { data } = await http.get<PagedResponse<ServiceItem>>(
      API_ENDPOINTS.services.list,
      { params },
    );
    return data;
  },

  async getById(id: number) {
    const { data } = await http.get<ServiceItem>(
      API_ENDPOINTS.services.detail(id),
    );
    return data;
  },

  async create(payload: ServicePayload) {
    const { data } = await http.post<ServiceItem>(
      API_ENDPOINTS.services.list,
      payload,
    );
    return data;
  },

  async update(id: number, payload: ServicePayload) {
    const { data } = await http.put<ServiceItem>(
      API_ENDPOINTS.services.detail(id),
      payload,
    );
    return data;
  },
};
