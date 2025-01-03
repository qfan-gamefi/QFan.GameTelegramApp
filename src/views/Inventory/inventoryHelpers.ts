export function renderTitleKey(key: string) {
    return key
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());
}

export const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 10000) {
        return `${(num / 1000).toFixed(0)}K`;
    } else {
        return num?.toString();
    }
}