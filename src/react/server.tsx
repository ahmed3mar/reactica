// @ts-nocheck
import React, { Suspense, useContext } from 'react'
import ReactDOMServer from 'react-dom/server'
import {
    Route,
    useRoutes,
    Routes,
} from 'react-router-dom'

// @ts-ignore
import loadPages from 'virtual:reactica:pages-sync'
import { StaticRouter } from "react-router-dom/server";
import { RouterProvider } from './router';
import { AuthProvider } from './auth';
import { CookiesProvider } from './cookies';
import { HtmlContext, HtmlProvider } from './html-context';
import { HelmetProvider, Helmet } from 'react-helmet-async';

import { parseRoutes } from './routes';

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
        // <HelmetProvider context={helmetContext}>
            <AuthProvider>
                <RouterProvider serverContext={context} routes={pages}>
                    <Wrapper context={context} routes={renderRoutes(routes)} NotFound={NotFound}>
                        {pages}
                    </Wrapper>
                </RouterProvider>
            </AuthProvider>
        // </HelmetProvider>
    );

}

export const Application = ({ routes, NotFound, Wrapper, context }: any) => {
    return (
        <StaticRouter location={context.url}>
            <App routes={routes} NotFound={NotFound} Wrapper={Wrapper} context={context} />
        </StaticRouter>
    )
}

const Document = () => {
    console.log('------------ context !!!!', useContext(HtmlContext));

    return (
        <div>
            ----
        </div>
    )
}

export const renderString = context => {
    const PRESERVED = import.meta.globEager('/src/pages/(_app|_wrapper|_document|404).(ts|tsx|js|jsx)')
    const ROUTES = import.meta.globEager('/src/pages/**/[a-z[]*.(ts|tsx|js|jsx)')
    const LAYOUTS = import.meta.globEager('/src/pages/**/_layout.(ts|tsx|js|jsx)')

    const { routes, Document, Wrapper, NotFound } = parseRoutes(context, PRESERVED, ROUTES, LAYOUTS, false)
    // const { routes, Document, Wrapper, NotFound } = loadPages(context)

    console.log('XDocument', Document);
    

    // const content = ReactDOMServer.renderToString(
    //     <CookiesProvider context={context.cookies}>
    //         <Application routes={routes} NotFound={NotFound} Wrapper={Wrapper} context={context} />
    //     </CookiesProvider>
    // )

    const html = ReactDOMServer.renderToString(
        <HtmlProvider value={{
            // head,
            helmetContext: helmetContext.helmet,
            docComponentsRendered: {}
        }}>
            <Document />
        </HtmlProvider>
    );

    return html.replace('<div id="reactica-app"></div>', `<div id="reactica-app">XXX</div>`)
}