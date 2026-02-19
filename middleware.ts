import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Let everything through that's auth-related
    if (
        searchParams.has("code") ||
        searchParams.has("error") ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const hasCookie = request.cookies.getAll().some(c => c.name.startsWith("sb-"));

    if (!hasCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image).*)"],
};
