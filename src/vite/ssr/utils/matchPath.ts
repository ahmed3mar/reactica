
function warning(cond: any, message: string): void {
    if (!cond) {
        // eslint-disable-next-line no-console
        if (typeof console !== "undefined") console.warn(message);

        try {
            // Welcome to debugging React Router!
            //
            // This error is thrown as a convenience so you can more easily
            // find the source for a warning that appears in the console by
            // enabling "pause on exceptions" in your JavaScript debugger.
            throw new Error(message);
            // eslint-disable-next-line no-empty
        } catch (e) { }
    }
}

export function matchPath(
    pattern: any,
    pathname: string
) {
    if (typeof pattern === "string") {
        pattern = { path: pattern, caseSensitive: false, end: true };
    }

    let [matcher, paramNames] = compilePath(
        pattern.path,
        pattern.caseSensitive,
        pattern.end
    );

    let match = pathname.match(matcher);
    if (!match) return null;

    let matchedPathname = match[0];
    let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
    let captureGroups = match.slice(1);
    let params = paramNames.reduce(
        (memo: any, paramName, index) => {
            // We need to compute the pathnameBase here using the raw splat value
            // instead of using params["*"] later because it will be decoded then
            if (paramName === "*") {
                let splatValue = captureGroups[index] || "";
                pathnameBase = matchedPathname
                    .slice(0, matchedPathname.length - splatValue.length)
                    .replace(/(.)\/+$/, "$1");
            }

            memo[paramName] = safelyDecodeURIComponent(
                captureGroups[index] || "",
                paramName
            );
            return memo;
        },
        {}
    );

    return {
        params,
        pathname: matchedPathname,
        pathnameBase,
        pattern
    };
}


function safelyDecodeURIComponent(value: string, paramName: string) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        warning(
            false,
            `The value for the URL param "${paramName}" will not be decoded because` +
            ` the string "${value}" is a malformed URL segment. This is probably` +
            ` due to a bad percent encoding (${error}).`
        );

        return value;
    }
}

function compilePath(
    path: string,
    caseSensitive = false,
    end = true
): [RegExp, string[]] {
    warning(
        path === "*" || !path.endsWith("*") || path.endsWith("/*"),
        `Route path "${path}" will be treated as if it were ` +
        `"${path.replace(/\*$/, "/*")}" because the \`*\` character must ` +
        `always follow a \`/\` in the pattern. To get rid of this warning, ` +
        `please change the route path to "${path.replace(/\*$/, "/*")}".`
    );

    let paramNames: string[] = [];
    let regexpSource =
        "^" +
        path
            .replace(/\/*\*?$/, "") // Ignore trailing / and /*, we'll handle it below
            .replace(/^\/*/, "/") // Make sure it has a leading /
            .replace(/[\\.*+^$?{}|()[\]]/g, "\\$&") // Escape special regex chars
            .replace(/:(\w+)/g, (_: string, paramName: string) => {
                paramNames.push(paramName);
                return "([^\\/]+)";
            });

    if (path.endsWith("*")) {
        paramNames.push("*");
        regexpSource +=
            path === "*" || path === "/*"
                ? "(.*)$" // Already matched the initial /, just match the rest
                : "(?:\\/(.+)|\\/*)$"; // Don't include the / in params["*"]
    } else {
        regexpSource += end
            ? "\\/*$" // When matching to the end, ignore trailing slashes
            : // Otherwise, match a word boundary or a proceeding /. The word boundary restricts
            // parent routes to matching only their own words and nothing more, e.g. parent
            // route "/home" should not match "/home2".
            "(?:\\b|\\/|$)";
    }

    let matcher = new RegExp(regexpSource, caseSensitive ? undefined : "i");

    return [matcher, paramNames];
}