/**
 * Formats a size in MB into a human-readable string (MB, GB, TB)
 */
export const formatStorage = (mb: number): string => {
    if (mb <= 0) return '0 MB';

    const units = ['MB', 'GB', 'TB', 'PB'];
    let value = mb;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    // Use 2 decimals for TB/PB, 1 for GB, 0 for MB
    const decimals = unitIndex >= 2 ? 2 : (unitIndex === 1 ? 1 : 0);
    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
};

/**
 * Calculates percentage and ensures it's between 0 and 100
 */
export const calculatePercent = (used: number, total: number): number => {
    if (!total || total <= 0) return 0;
    const percent = (used / total) * 100;
    return Math.min(Math.max(0, percent), 100);
};
