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
    setCookie(`${config.storageKey}_sb`, sortBy, config.path);
    setCookie(`${config.storageKey}_so`, order, config.path);
}

export async function saveQueryFilterPreferences(
    filterType: keyof typeof FILTER_CONFIGS,
    queryName: "season" | "year" | "page",
    value: string
) {
    const config = FILTER_CONFIGS[filterType];

    if (queryName === "year")
        await setCookie(`${config.storageKey}_yr`, value, config.path);

    else if (queryName === "page")
        await setCookie(`${config.storageKey}_pg`, value, config.path);

    else
        await setCookie(`${config.storageKey}_ss`, value, config.path);
}

export async function getFilterPreferences(filterType: keyof typeof FILTER_CONFIGS) {
    const config = FILTER_CONFIGS[filterType];
    const cookieStore = await cookies();

    return {
        sortBy: cookieStore.get(`${config.storageKey}_sb`)?.value,
        order: cookieStore.get(`${config.storageKey}_so`)?.value,
        year: cookieStore.get(`${config.storageKey}_yr`)?.value,
        page: cookieStore.get(`${config.storageKey}_pg`)?.value,
        season: cookieStore.get(`${config.storageKey}_ss`)?.value,
    };
}