
export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refreshToken: "/auth/refresh-token",
  },
  services: {
    list: "/services",
    detail: (id: number) => `/services/${id}`,
  },
  staffs: {
    list: "/staffs",
    schedules: (id: number) => `/staffs/${id}/schedules`,
  },
  bookings: {
    availableSlots: "/bookings/available-slots",
    create: "/bookings",
    list: "/bookings",
    myBookings: "/bookings/my-bookings",
    updateStatus: (id: number) => `/bookings/${id}/status`,
    cancel: (id: number) => `/bookings/${id}/cancel`,
  },
} as const;
