import type { NextConfig } from "next";

/**
 * Server-only: không có tiền tố NEXT_PUBLIC_ nên biến này không bị inline vào bundle trình duyệt.
 * Dùng cho rewrites để proxy /api/* sang backend .NET => request trở thành same-origin,
 * nên cookie httpOnly của backend được gửi tự động và không cần CORS.
 */
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5036";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE_URL}/api/:path*`,
      },
      {
        source: "/hubs/:path*",
        destination: `${API_BASE_URL}/hubs/:path*`,
      },
    ];
  },
};

export default nextConfig;
