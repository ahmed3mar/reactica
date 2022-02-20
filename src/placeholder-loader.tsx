import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FilledContext, HelmetProvider } from "react-helmet-async";
import placeholder from "virtual:reacticajs:placeholder";
import devalue from "devalue";

export default async (htmlTemplate: string, pageRoutes: any) => {
    const nodes = await placeholder();

    const helmetContext = {};

    const rendered = renderToStaticMarkup(
        <HelmetProvider context={helmetContext}>{nodes}</HelmetProvider>,
    );

    const { helmet } = helmetContext as FilledContext;

    let head = `<!-- reactica-context-placeholder -->`;

    if (pageRoutes) {
        head += `<script>$reactica$routes=${devalue(pageRoutes)}</script>`;
    }

    head +=
        helmet.base.toString() +
        helmet.link.toString() +
        helmet.meta.toString() +
        helmet.noscript.toString() +
        helmet.script.toString() +
        helmet.style.toString() +
        helmet.title.toString();

    let html = htmlTemplate.replace("<!-- reactica-head-placeholder -->", head);

    const htmlAttributes = helmet.htmlAttributes.toString();
    html = html.replace(
        "><!-- reactica-html-attributes-placeholder -->",
        htmlAttributes ? " " + htmlAttributes + ">" : ">",
    );

    const bodyAttributes = helmet.bodyAttributes.toString();
    html = html.replace(
        "><!-- reactica-body-attributes-placeholder -->",
        bodyAttributes ? " " + bodyAttributes + ">" : ">",
    );

    html = html.replace("<!-- reactica-app-placeholder -->", rendered);

    return html;
};