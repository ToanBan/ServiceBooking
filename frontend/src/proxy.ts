import { NextResponse, type NextRequest } from "next/server";


export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.cookies.has("refreshToken")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?redirect=${encodeURIComponent(pathname)}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/booking/:path*", "/my-bookings/:path*", "/admin/:path*"],
};
