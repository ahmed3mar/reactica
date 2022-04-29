// @ts-nocheck
import React, { Suspense } from 'react'
import ReactDOMServer from 'react-dom/server'
import {
    Route,
    useRoutes,
    Routes,
} from 'react-router-dom'

// @ts-ignore
import loadPages from 'virtual:reacticajs:pages-sync'
import { StaticRouter } from "react-router-dom/server";
import { RouterProvider } from './router';
import { AuthProvider } from './auth';
import { CookiesProvider } from './cookies';
import { HtmlContext } from './html-context';
import { HelmetProvider, Helmet } from 'react-helmet-async';

const helmetContext = {};

function App({ routes, Wrapper, NotFound, context }) {
    const pages = useRoutes(routes);

    const renderRoutes = (routes: any) => {
        // @ts-ignore
        return routes.map(({ children, path, ...route }, index) => {
            // remove first /
            path = path.replace(/^\//, '');
            return (
                children ? (
                    <Route key={index} path={path} {...route}>
                        {renderRoutes(children)}
                    </Route>
                ) : (
                    <Route key={index} path={path} {...route} />
                )
            )
        })
    }

    return (
        <HelmetProvider context={helmetContext}>
            <AuthProvider>
                <RouterProvider serverContext={context} routes={pages}>
                    <Wrapper context={context} routes={renderRoutes(routes)} NotFound={NotFound}>
                        {pages}
                    </Wrapper>
                </RouterProvider>
            </AuthProvider>
        </HelmetProvider>
    );

}

export const Application = ({ routes, NotFound, Wrapper, context }: any) => {
    return (
        <StaticRouter location={context.url}>
            <App routes={routes} NotFound={NotFound} Wrapper={Wrapper} context={context} />
        </StaticRouter>
    )
}

export const renderString = context => {
    const { routes, Document, Wrapper, NotFound } = loadPages(context)

    const content = ReactDOMServer.renderToString(
        <CookiesProvider context={context.cookies}>
            <Application routes={routes} NotFound={NotFound} Wrapper={Wrapper} context={context} />
        </CookiesProvider>
    )

    const html = ReactDOMServer.renderToString(
        <HtmlContext.Provider value={{
            // head,
            helmetContext: helmetContext.helmet,
            docComponentsRendered: {}
        }}>
            <Document />
        </HtmlContext.Provider>
    );

    return html.replace('<div id="reactica-app"></div>', `<div id="reactica-app">${content}</div>`)
}
