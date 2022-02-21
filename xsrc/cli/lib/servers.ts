import { createServer as createViteServer, ViteDevServer } from "vite";
import { createServer as createHttpServer } from "http";
import { makeViteConfig } from "./vite-config";
import { encode } from "html-entities";
import { htmlTemplate } from "./html-template";
import { FullConfig } from "../../../index";
import chalk, { Chalk } from "chalk";
import path from "path";
import {Headers} from "node-fetch";

export interface ServersConfig {
    config: FullConfig;
    deps?: string[];
    onReload?: () => void;
}

export async function createServers({
                                        config,
                                        deps: configDeps,
                                        onReload,
                                    }: ServersConfig) {
    let vite: ViteDevServer;

    const http = createHttpServer({}, async (req, res) => {
        const url = req.url || "/";

        const viteConfig = await makeViteConfig(config, "node", "dev", {
            configDeps,
            onConfigChange: onReload,
        });

        if (!vite) {
            vite = await createViteServer({ ...viteConfig });
        }

        vite.middlewares(req, res, async (x: any) => {

            let html = htmlTemplate;

            function logResponse() {
                const statusType = Math.floor(res.statusCode / 100);

                const statusColorMap: Record<number, Chalk | undefined> = {
                    2: chalk.green,
                    3: chalk.blue,
                    4: chalk.yellow,
                    5: chalk.redBright,
                };

                const statusColor = statusColorMap[statusType] || chalk.magenta;

                const methodColorMap: Record<string, Chalk | undefined> = {
                    GET: chalk.white,
                    HEAD: chalk.gray,
                    POST: chalk.green,
                    PUT: chalk.yellowBright,
                    DELETE: chalk.red,
                    CONNECT: chalk.blue,
                    OPTIONS: chalk.magentaBright,
                    TRACE: chalk.blueBright,
                    PATCH: chalk.yellow,
                };

                const methodColor = methodColorMap[req.method || ""] || chalk.magenta;

                // eslint-disable-next-line no-console
                console.log(
                    statusColor(res.statusCode),
                    methodColor((req.method || "").padEnd(8)),
                    req.url,
                );
            }

            try {
                // Force them into module cache. Otherwise symlinks confuse vite.
                await vite.ssrLoadModule("reactica");
                const { handleRequest } = await vite.ssrLoadModule("reactica/server");

                console.log('handleRequest', await vite.ssrLoadModule("reactica"))

                const pageRoutes = (
                    await vite.ssrLoadModule("virtual:reacticajs:pages")
                );

                console.log('pageRoutes', pageRoutes)

                const trustForwardedOrigin = config.trustForwardedOrigin

                const proto =
                    (trustForwardedOrigin && (req.headers["x-forwarded-proto"] as string)) ||
                    "http";
                const host =
                    (trustForwardedOrigin && (req.headers["x-forwarded-host"] as string)) ||
                    req.headers.host ||
                    "localhost";
                const ip =
                    (trustForwardedOrigin && (req.headers["x-forwarded-for"] as string)) ||
                    req.socket.remoteAddress ||
                    "";

                const response = await handleRequest({
                    apiRoutes: {},
                    pageRoutes: {},
                    htmlTemplate,
                    htmlPlaceholder: {},
                    manifest: {},
                    request: {
                        // ip,
                        url: new URL(req.url || "/", `${proto}://${host}`),
                        method: req.method || "GET",
                        headers: new Headers(req.headers as Record<string, string>),
                        // type,
                        // body,
                        originalIp: req.socket.remoteAddress!,
                        originalUrl: new URL(
                            req.url || "/",
                            `http://${req.headers.host || "localhost"}`,
                        ),
                    },
                    // getCachedResponse,
                    // saveResponse,
                });

                res.statusCode = response.status ?? 200;

                let headers = response.headers;
                if (!headers) headers = [];
                if (!Array.isArray(headers)) headers = Object.entries(headers);

                headers.forEach(([name, value]: [string, string | string[] | undefined]) => {
                    if (value === undefined) return;
                    res.setHeader(name, value);
                });

                if (
                    response.body === null ||
                    response.body === undefined ||
                    response.body instanceof Uint8Array ||
                    typeof response.body === "string"
                ) {
                    res.end(response.body);
                } else {
                    res.end(JSON.stringify(response.body));
                }

                // const pageRoutes = (
                //     await vite.ssrLoadModule("virtual:reacticajs:page-routes")
                // ).default;
                // const apiRoutes = (
                //     await vite.ssrLoadModule("virtual:reacticajs:api-routes")
                // ).default;
                //
                // const all = (await vite.ssrLoadModule(
                //     path.resolve(__dirname, "entries/handle-node-request.js"),
                // )) as typeof import("../runtime/handle-node-request");
                //
                // const { handleNodeRequest } = all;
                //
                // html = await vite.transformIndexHtml(url, html);
                //
                // const htmlPlaceholder = await (
                //     await vite.ssrLoadModule("virtual:reacticajs:placeholder-loader")
                // ).default(html, pageRoutes);
                //
                // console.log(pageRoutes)
                //
                // await handleNodeRequest({
                //     pageRoutes,
                //     apiRoutes,
                //     htmlTemplate: html,
                //     htmlPlaceholder,
                //     req,
                //     res,
                //     handleRequest,
                //     trustForwardedOrigin: config.trustForwardedOrigin,
                // });

                // TODO: Logging
                logResponse();
            } catch (error: any) {
                vite.ssrFixStacktrace(error);
                // eslint-disable-next-line no-console
                console.error(error.stack ?? "Unknown error");

                res.setHeader("content-type", "text/html");
                res.statusCode = error.status || 500;

                logResponse();

                res.end(
                    htmlTemplate.replace(
                        "<!-- reactica-app-placeholder -->",
                        "<pre>A server-side render error has occured:\n\n" +
                        encode(error.stack || error.message || "Unknown error") +
                        "</pre>",
                    ),
                );
            }
        });
    });

    http.on("close", async () => {
        await vite.ws.close();
        await vite.close();
    });

    return { http, config };
}