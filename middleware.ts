import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    matcher: [
        /*
         Run middleware on all routes EXCEPT:
         - _next (static)
         - favicon
         - login
         - auth routes
         - OAuth callback with ?code=
        */
        "/((?!_next/static|_next/image|favicon.ico|login|auth).*)",
    ],
};
