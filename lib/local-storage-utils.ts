export const loadFromLocalStorage = <T>(key: string) => {
    try {
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem(key);
            const res: T = storedValue ? JSON.parse(storedValue) : null;
            return res;
        }
        return null;
    }
    catch (err) {
        console.error(err);
        return null;
    }
};

export const setInLocalStorage = (key: string, value: unknown) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export const removeFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
}