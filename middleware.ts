import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname, origin } = req.nextUrl;

    // Protected route patterns
    const editPattern = /^\/liturgical-selections\/[^\/]+\/edit$/;

    const isProtected =
        editPattern.test(pathname) ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/liturgical-selections/new");

    const isAuthPage =
        pathname.startsWith("/signin") ||
        pathname.startsWith("/verify-request");

    const isLoggedIn = !!req.auth;

    // Redirect unauthenticated users from protected routes
    if (isProtected && !isLoggedIn) {
        const signinUrl = new URL("/signin", origin);
        signinUrl.searchParams.set("callbackUrl", req.url); // use full URL here
        return NextResponse.redirect(signinUrl);
    }

    // Redirect logged-in users away from auth pages
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/", origin));
    }

    // Allow all other requests
    return NextResponse.next();
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/settings/:path*",
        "/liturgical-selections/:path*",
        "/signin/:path*",
        "/verify-request/:path*",
    ],
};