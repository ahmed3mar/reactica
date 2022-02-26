import path from "path";
import { InlineConfig, normalizePath, SSROptions } from "vite";
import { FullConfig, ReacticaDeploymentTarget } from "../../../index";
import { reacticaVitePlugin } from "./vite-plugin";

import react from '@vitejs/plugin-react'

const resolve = (p: string) => path.resolve(process.cwd(), p)
export interface ConfigFlavorOptions {
    configDeps?: string[];
    onConfigChange?: () => void;
    ssr?: boolean;
}

export async function makeViteConfig(
    config: FullConfig,
    deploymentTarget: ReacticaDeploymentTarget,
    buildId: string,
    { configDeps, onConfigChange, ssr }: ConfigFlavorOptions = {},
): Promise<InlineConfig & { ssr: SSROptions }> {
    const srcDir = normalizePath(path.resolve("src"));
    const publicDir = normalizePath(path.resolve("public"));
    const pagesDir = resolve(config.pagesDir);
    const apiDir = normalizePath(config.apiDir);

    let viteConfig = config.vite;
    if (typeof viteConfig === "function") {
        viteConfig = await viteConfig(
            onConfigChange ? undefined : ssr ? "ssr" : "client",
        );
    }

    let noExternal: true | (string | RegExp)[] = ["reactica", "reactica/server"];

    const ssrConf = viteConfig.ssr || {};

    if (ssrConf.noExternal === true) {
        noExternal = true;
    } else if (typeof ssrConf.noExternal === "string") {
        noExternal.push(ssrConf.noExternal);
    } else if (Array.isArray(ssrConf.noExternal)) {
        noExternal = noExternal.concat(ssrConf.noExternal);
    }

    const result: InlineConfig & { ssr: SSROptions } = {
        ...viteConfig,
        configFile: false,
        root: srcDir,
        publicDir,

        server: {
            ...viteConfig.server,
            middlewareMode: "ssr",
        },

        optimizeDeps: {
            ...viteConfig.optimizeDeps,
            exclude: [
                ...(viteConfig.optimizeDeps?.exclude || [
                    "reactica",
                    "reactica/server",
                ]),
            ],
            include: [
                ...(viteConfig.optimizeDeps?.include || []),
                "react",
                "react-dom",
                "react-dom/server",
                "react-helmet-async",
            ],
        },

        resolve: {
            ...viteConfig.resolve,
            dedupe:
                deploymentTarget === "cloudflare-workers"
                    ? [
                        ...(viteConfig.resolve?.dedupe || []),
                        "react",
                        "react-dom",
                        "react-dom/server",
                        "react-helmet-async",
                    ]
                    : undefined,
        },
        plugins: [
            ...(viteConfig.plugins || []),

            // Pages({
            //     importMode: "sync",
            //     resolver: "react",
            //     routeStyle: "next",
            //     extensions: ["tsx", "jsx"],
            //     pagesDir: pagesDir,
            // }),

            await reacticaVitePlugin({
                srcDir,
                pagesDir,
                apiDir,
                pageExtensions: config.pageExtensions,
                endpointExtensions: config.endpointExtensions,
                apiRoot: config.apiRoot,
                configDeps,
                babel: config.babel,
                removeRequireHook: !!ssr && deploymentTarget === "cloudflare-workers",
                onConfigChange,
            }),
        ],
        define: {
            ...viteConfig.define,
            REACTICA_BUILD_TARGET: JSON.stringify(deploymentTarget),
            REACTICA_BUILD_ID: JSON.stringify(buildId),
            REACTICA_DEFAULT_LOCALE: JSON.stringify(config.locales?.default || "en"),
            REACTICA_DETECT_LOCALE: JSON.stringify(!!config.locales?.detect),
            REACTICA_LOCALE_COOKIE_NAME: JSON.stringify(config.locales?.cookieName),
        },

        ssr: {
            // This may not be required anymore
            ...(viteConfig.ssr || {}),
            external: viteConfig.ssr?.external,
            noExternal,
        },
    };

    return result;
}