import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/coach/login", "/coach/register", "/athlete/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes and invite routes — no auth needed
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/invite")
  ) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);

  // Not authenticated
  if (!user) {
    if (pathname.startsWith("/coach")) {
      return NextResponse.redirect(new URL("/coach/login", request.url));
    }
    if (pathname.startsWith("/athlete")) {
      return NextResponse.redirect(new URL("/athlete/login", request.url));
    }
    return supabaseResponse;
  }

  // Check role from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // Coach routes require coach role
  if (pathname.startsWith("/coach") && role !== "coach") {
    return NextResponse.redirect(new URL("/athlete/login", request.url));
  }

  // Athlete routes require athlete role
  if (pathname.startsWith("/athlete") && role !== "athlete") {
    return NextResponse.redirect(new URL("/coach/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
