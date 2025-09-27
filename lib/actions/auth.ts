'use server'

import { signIn, signOut } from '@/auth';

import { z } from 'zod';

const loginSchema = z.object({
    email: z.email({
        message: 'Please enter a valid email address',
    }),
});

export async function googleAuthenticate(_: unknown, formData: FormData) {

    const callbackUrl = formData.get('callbackUrl') as string || '/';
    await signIn('google', { redirectTo: callbackUrl });
    return {
        success: true,
        message: 'Login Successful!',
        formData: null
    }

}

export async function emailAuthenticate(_: unknown, formData: FormData) {

    const callbackUrl = formData.get('callbackUrl') as string || '/';
    const email = formData.get('email') as string;

    const result = loginSchema.safeParse({ email })

    if (!result.success) {
        const flattened = z.flattenError(result.error);
        const errors = flattened.fieldErrors;
        return {
            success: false,
            message: errors.email?.join(','),
            formData: formData
        }
    }

    await signIn('email', { email, redirectTo: callbackUrl });
    return {
        success: true,
        message: 'Login Successful!',
        formData: null
    }

}

export async function logout() {
    await signOut({ redirectTo: '/' });
    return {
        success: true,
        message: 'Logout Successful!',
        formData: null
    }
}