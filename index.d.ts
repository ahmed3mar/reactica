import { TransformOptions } from "@babel/core";
import { UserConfig, SSROptions } from "vite";
import { BuildOptions as EsbuildOptions } from "esbuild";

export * from "./lib";

declare global {
    const REACTOCA_BUILD_TARGET:
        | "node"
        | "static"
        | "vercel"
        | "netlify"
        | "cloudflare-workers";

    const REACTOCA_BUILD_ID: string;

    const REACTOCA_DEFAULT_LOCALE: string;
    const REACTOCA_DETECT_LOCALE: boolean;
    const REACTOCA_LOCALE_COOKIE_NAME: string | undefined;
}

type ViteConfig = UserConfig & { ssr?: SSROptions };

// @ts-ignore
export function defineConfig(configOrConfigFactory: ConfigExport);

export type ConfigExport =
    | Config
    | Promise<Config>
    | ((info: ConfigFactoryInfo) => Config | Promise<Config>);

export interface FullConfig {
    /**
     * File extensions for pages and layouts @default ["jsx", "tsx"] */
    pageExtensions: string[];

    /** Directory that contains pages and layouts @default "pages" */
    pagesDir: string;

    /** File extensions for endpoints and middleware @default ["js", "ts"] */
    endpointExtensions: string[];

    /** Directory that contains endpoints and middleware @default "api" */
    apiDir: string;

    /** Base URL for endpoints @default "/api" */
    apiRoot: string;

    /** Paths to start crawling when pre-rendering */
    prerender: string[];

    /** Trust the x-forwarded-host and x-forwarded-proto headers in dev server.
     * This is useful behind a reverse proxy. Set env variable TRUST_FORWARDED_ORIGIN to
     * a non-empty string if you want the same in production.
     * @default false */
    trustForwardedOrigin: boolean;

    /** Locale detection settings */
    locales?: {
        /** Default locale @default "en" */
        default?: string;
        /** Whether to attempt detecting the locale @default false */
        detect?: boolean;
        /** Name of the cookie for manually overriding the locale */
        cookieName?: string;
    };

    /** Vite configuration (not all options are supported) */
    vite:
        | ViteConfig
        | ((type?: ViteBuiltType) => ViteConfig | Promise<ViteConfig>);

    /** Babel options passed to Vite's React plugin */
    babel: TransformOptions;

    /** Hook to modify ESBuild options used when bundling serverless functions */
    modifyEsbuildOptions?(options: EsbuildOptions): void | Promise<void>;
}

export type Config = Partial<FullConfig>;

export interface ConfigFactoryInfo {
    /** Reactica command that is being executed */
    command: ReacticaCommand;
    /** Deployment target (only available for the "build" command) */
    deploymentTarget?: ReacticaDeploymentTarget;
}

export type ReacticaDeploymentTarget =
    | "node"
    | "static"
    | "vercel"
    | "netlify"
    | "cloudflare-workers";

export type ReacticaCommand = "dev" | "build";

/** Whether the config will be used for the client build or the SSR build. Not available during dev. */
export type ViteBuiltType = "client" | "ssr";