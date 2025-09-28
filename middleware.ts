import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig)

// protected routes
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/create/:path*',
        '/edit/:path*',
        '/view/:path*',
        '/mass-selections/:path*',
    ],
}