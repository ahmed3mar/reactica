import React, { StrictMode } from 'react'
import { StaticRouter } from "react-router-dom/server";
import { renderToString } from "react-dom/server";
import {
    PageRenderOptions,
    ReacticaResponse, ServePageHook,
} from ".";

import { Route } from "./lib/find-route";

import {
    RawRequest,
} from "./lib/types";

export type { Route };

export interface CachedResponse {
    response: ReacticaResponse;
    expired: false;
}

export interface ReacticaServerResponse extends ReacticaResponse {
    waitUntil?: Promise<any>;
}

const pendingResponses: Record<string, Promise<ReacticaResponse> | undefined> =
    {};

interface RequestContext {
    htmlTemplate: string;
    htmlPlaceholder: string;
    apiRoutes: Route[];
    pageRoutes: Route[];
    manifest?: Record<string, string[] | undefined>;
    request: RawRequest;
    getCachedResponse?(path: string): Promise<CachedResponse | undefined>;
    saveResponse?(path: string, response: ReacticaResponse): Promise<void>;
    prerendering?: boolean;
}

export async function handleRequest(
    context: RequestContext,
): Promise<ReacticaServerResponse> {
    const path = decodeURI(context.request.url.pathname);

    const cached = await context.getCachedResponse?.(path);

    if (cached) {
        if (cached.expired && !pendingResponses[path]) {
            pendingResponses[path] = generateResponse(path, context).finally(() => {
                delete pendingResponses[path];
            });
        }

        return {
            ...cached.response,
            waitUntil: pendingResponses[path],
        };
    }

    return generateResponse(path, context);
}

export async function generateResponse(
    path: string,
    {
        htmlTemplate,
        htmlPlaceholder,
        apiRoutes,
        pageRoutes,
        manifest,
        request,
        getCachedResponse,
        saveResponse,
        prerendering,
    }: RequestContext,
): Promise<ReacticaResponse> {

    const serverHooks = {};
    const { servePage = (req, render) => render(req) } = serverHooks as {
        servePage: ServePageHook | undefined;
    };

    const locale = 'en';

    async function render(
        request: RawRequest,
        context: any = {},
        options: PageRenderOptions = {},
    ): Promise<ReacticaResponse> {

        // console.log('routes', routes)

        const response = {
            status: 200,
            headers: {},
            body: renderToString(
                <StrictMode>
                    <StaticRouter location={request.url}>
                        
                    </StaticRouter>
                </StrictMode>
            ),
        };

        return response;
    }


    return servePage(request, render, locale);
}
