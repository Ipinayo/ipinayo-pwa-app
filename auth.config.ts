import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export default {
    providers: [Google],
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id
            }
            return session
        },
    },
    pages: {
        signIn: "/signin",
        verifyRequest: "/verify-request",
        error: "/signin/error"
    },
    session: {
        strategy: "jwt",
    }
} satisfies NextAuthConfig