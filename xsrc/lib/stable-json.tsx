export function stableJson(data: unknown): string {
    return JSON.stringify(data, (_key, value) => {
        if (typeof value === "object" && value && !Array.isArray(value)) {
            // Sort keys
            return Object.fromEntries(
                Object.keys(value)
                    .sort()
                    .map((k) => [k, value[k]]),
            );
        }

        return value;
    });
}