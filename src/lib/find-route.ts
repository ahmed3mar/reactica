export type Route = [regexp: RegExp, pattern: string, ids: string[]];

export function findRoute(
    path: string,
    routes: Route[],
    force?: boolean,
):
    | {
    params: Record<string, string>;
    match?: string;
    stack: string[];
}
    | undefined {
    let notFound = false;

    for (;;) {
        for (const route of routes) {
            const [regexp, pattern, moduleIds] = route;
            const match = path.match(regexp);

            if (match) {
                const names = [...pattern.matchAll(/\[([^\]]+)\]/g)].map((x) => x[1]);

                const params = Object.fromEntries(
                    match?.slice(1).map((m, i) => [names[i], decodeURIComponent(m)]),
                );

                return {
                    params,
                    match: notFound ? undefined : pattern,
                    stack: notFound ? moduleIds.slice(0, -1) : moduleIds,
                };
            }
        }

        if (!force || path === "/") return undefined;
        notFound = true;

        path = path.slice(0, path.lastIndexOf("/"));
    }
}