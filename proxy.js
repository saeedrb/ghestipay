import { NextResponse } from "next/server";

export function proxy(req) {
  const token = req.cookies.get("token")?.value;
  const authPath = ["/", "/login", "/otp"];

  const { pathname } = req.nextUrl;
  const isPublicStoreOrderPath = pathname === "/user/requests/new";

  if (!token && pathname.startsWith("/user") && !isPublicStoreOrderPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && pathname.startsWith("/shop")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && authPath.includes(pathname)) {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/shop/:path*", "/", "/otp"],
};


