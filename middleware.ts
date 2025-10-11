import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig)

// protected routes
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/mass-selections/:path*',
    ],
}