'use server';

import { cookies } from 'next/headers';

type FilterConfig = {
    path: string;
    storageKey: string;
};

const FILTER_CONFIGS: Record<string, FilterConfig> = {
    selections: {
        path: '/liturgical-selections',
        storageKey: 'sel',
    },
    dashboard: {
        path: '/dashboard',
        storageKey: 'dash',
    }
};

export async function saveFilterPreferences(
    filterType: keyof typeof FILTER_CONFIGS,
    sortBy: string,
    order: string
) {
    const config = FILTER_CONFIGS[filterType];
    const cookieStore = await cookies();

    cookieStore.set(`${config.storageKey}_sb`, sortBy, {
        path: config.path,
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false, // Allow client-side reading if needed
    });

    cookieStore.set(`${config.storageKey}_so`, order, {
        path: config.path,
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
    });
}

export async function getFilterPreferences(filterType: keyof typeof FILTER_CONFIGS) {
    const config = FILTER_CONFIGS[filterType];
    const cookieStore = await cookies();

    return {
        sortBy: cookieStore.get(`${config.storageKey}_sb`)?.value,
        order: cookieStore.get(`${config.storageKey}_so`)?.value,
    };
}