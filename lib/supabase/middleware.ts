import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Missing Supabase environment variables in middleware. URL:", !!supabaseUrl, "Key:", !!supabaseAnonKey);
            return supabaseResponse;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError) {
            console.error("Supabase auth error in middleware:", userError);
        }

        const isAuthCallback = request.nextUrl.searchParams.has("code");

        if (
            !user &&
            !isAuthCallback &&
            !request.nextUrl.pathname.startsWith("/login") &&
            !request.nextUrl.pathname.startsWith("/auth")
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    } catch (error) {
        console.error("Unexpected error in middleware:", error);
    }

    return supabaseResponse;
}
