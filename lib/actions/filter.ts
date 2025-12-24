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
    },
    admin_users: {
        path: '/admin/users',
        storageKey: 'admin-users'
    },
    admin_selections: {
        path: "/admin/selections",
        storageKey: "admin-sel"
    }
};

const setCookie = async (name: string, value: string, path: string) => {
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
        path,
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        httpOnly: false, // Allow client-side reading if needed
    });
}

export async function saveSortPreferences(
    filterType: keyof typeof FILTER_CONFIGS,
    sortBy: string,
    order: string
) {
    const config = FILTER_CONFIGS[filterType];
    await setCookie(`${config.storageKey}_sb`, sortBy, config.path);
    await setCookie(`${config.storageKey}_so`, order, config.path);
}

export async function saveQueryFilterPreferences(
    filterType: keyof typeof FILTER_CONFIGS,
    queryName: "season" | "year" | "query" | "page" | "role",
    value: string
) {
    const config = FILTER_CONFIGS[filterType];

    switch (queryName) {
        case "season":
            await setCookie(`${config.storageKey}_ss`, value, config.path);
            break;
        case "year":
            await setCookie(`${config.storageKey}_yr`, value, config.path);
            break;
        case "query":
            await setCookie(`${config.storageKey}_q`, value, config.path);
            break;
        case "page":
            await setCookie(`${config.storageKey}_pg`, value, config.path);
            break;
        case "role":
            await setCookie(`${config.storageKey}_r`, value, config.path);
            break;
        default:
            break;
    }
}

export async function getFilterPreferences(filterType: keyof typeof FILTER_CONFIGS) {
    const config = FILTER_CONFIGS[filterType];
    const cookieStore = await cookies();

    return {
        sortBy: cookieStore.get(`${config.storageKey}_sb`)?.value,
        order: cookieStore.get(`${config.storageKey}_so`)?.value,
        year: cookieStore.get(`${config.storageKey}_yr`)?.value,
        page: cookieStore.get(`${config.storageKey}_pg`)?.value,
        query: cookieStore.get(`${config.storageKey}_q`)?.value,
        season: cookieStore.get(`${config.storageKey}_ss`)?.value,
        role: cookieStore.get(`${config.storageKey}_r`)?.value,
    };
}