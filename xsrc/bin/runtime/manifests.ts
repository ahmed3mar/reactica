import type { Route } from "reactica/dist/server";

/* eslint-disable @typescript-eslint/no-var-requires */
export const apiRoutes: Route[] =
    require("$output/virtual_reactica_api-routes.js").default;
export const pageRoutes: Route[] =
    require("$output/virtual_reactica_page-routes.js").default;
export const manifest: Record<
    string,
    string[] | undefined
    > = require("$output/reactica-manifest.json");
export const htmlTemplate: string = require("$output/html-template.js");
export const htmlPlaceholder: string = require("$output/placeholder.js");
/* eslint-enable */