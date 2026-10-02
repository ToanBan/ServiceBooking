import { USER_ROLE, type UserRole } from "@/types/auth";

export const ROUTES = {
  login: "/login",
  register: "/register",
  services: "/services",
  booking: "/booking",
  myBookings: "/my-bookings",
  forbidden: "/forbidden",
  adminBookings: "/admin/bookings",
  home: "/",
} as const;

export const ROLE_HOME: Record<UserRole, string> = {
  [USER_ROLE.Customer]: ROUTES.home,
  [USER_ROLE.Admin]: ROUTES.adminBookings,
};

export const PROTECTED_ROUTES = [
  ROUTES.booking,
  ROUTES.myBookings,
  "/admin",
] as const;
