declare let $reactica$rendered: any;
declare let $reactica$rootContext: Record<string, any>;

declare interface Window {
    $reactica$reloader: Record<string, (m: any) => void>;
    readonly $reactica$routes: any;
}

declare const REACTICA_BUILD_TARGET:
    | "node"
    | "static"
    | "vercel"
    | "netlify"
    | "cloudflare-workers";

declare const REACTICA_BUILD_ID: string;

declare const REACTICA_DEFAULT_LOCALE: string;
declare const REACTICA_DETECT_LOCALE: boolean;
declare const REACTICA_LOCALE_COOKIE_NAME: string | undefined;

declare module "virtual:reacticajs:page-imports" {
    const importer: Record<string, () => Promise<any>>;
    export default importer;
}

declare module "virtual:reacticajs:api-imports" {
    const importer: Record<string, () => Promise<any>>;
    export default importer;
}

declare module "virtual:reacticajs:server-hooks" {
    const servePage:
        | ((
        request: RawRequest,
        renderPage: (
            request: RawRequest,
            context?: Record<string, unknown>,
            options?: PageRenderOptions,
        ) => Promise<ReacticaResponse>,
    ) => Promise<ReacticaResponse>)
        | undefined;
}

declare module "virtual:reacticajs:client-hooks" {
    const beforeStartClient:
        | ((rootContext: RootContext) => Promise<void>)
        | undefined;

    const wrap:
        | undefined
        | ((page: JSX.Element, rootContext: RootContext) => JSX.Element);

    const createLoadHelpers:
        | undefined
        | ((rootContext: RootContext) => LoadHelpers | Promise<LoadHelpers>);
}

declare module "virtual:reacticajs:common-hooks" {
    const commonHooks: any;
    export default commonHooks;
}

declare module "virtual:reacticajs:placeholder" {
    export default function render(): Promise<React.ReactNode>;
}