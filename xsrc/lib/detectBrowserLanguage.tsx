import { selectLocale } from "./selectLocale";

export function detectLanguage(available: string[]): string {
    if (!REACTICA_DETECT_LOCALE) return REACTICA_DEFAULT_LOCALE;

    let fromCookie: string | undefined;

    if (REACTICA_LOCALE_COOKIE_NAME) {
        const cookie = document.cookie;

        if (cookie) {
            const match = cookie.match(
                new RegExp(`(?:^|;)\\s*${REACTICA_LOCALE_COOKIE_NAME}=([^;]+)`),
            );

            if (match !== null) {
                fromCookie = match[1];
            }
        }
    }

    const languages = navigator.languages || [navigator.language || "en"];

    return selectLocale(
        fromCookie ? [fromCookie, ...languages] : languages,
        available,
    );
}