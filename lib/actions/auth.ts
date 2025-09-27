'use server'

import { signIn, signOut } from '@/auth';

export async function googleAuthenticate() {
    await signIn('google');
    return {
        success: true,
        message: 'Login Successful!',
        formData: null
    }
}

export async function emailAuthenticate(_: unknown, formData: FormData) {

    await signIn('email', formData);
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