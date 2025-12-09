export const CACHE_KEYS = {
    TRANSIT: 'gochar_transit_',
    NATAL: 'gochar_natal_'
};

export const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 Hours

export const saveToCache = (key: string, data: any) => {
    try {
        const item = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
        console.warn("Failed to save to cache", e);
    }
};

export const getFromCache = (key: string) => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = Date.now();

        if (now - item.timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }

        return item.data;
    } catch (e) {
        return null;
    }
};
