// @ts-nocheck
import { Suspense } from 'react'
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

function App({ routes, Wrapper, context }) {
    const pages = useRoutes(routes);

    return (
        <HelmetProvider context={helmetContext}>
            <AuthProvider>
                <RouterProvider serverContext={context} routes={pages}>
                    <Wrapper>
                    <Helmet>
        <title>Hello World</title>
        <link rel="canonical" href="https://www.tacobell.com/" />
      </Helmet>
                        {pages}
                    </Wrapper>
                </RouterProvider>
            </AuthProvider>
        </HelmetProvider>
    );

}

export const Application = ({ routes, Wrapper, context }: any) => {
    return (
        <StaticRouter location={context.url}>
            <App routes={routes} Wrapper={Wrapper} context={context} />
        </StaticRouter>
    )
}

export const renderString = context => {
    const { routes, Document, Wrapper } = loadPages(context)

    const content = ReactDOMServer.renderToString(
        <CookiesProvider context={context.cookies}>
            <Application routes={routes} Wrapper={Wrapper} context={context} />
        </CookiesProvider>
    )

    console.log('helmetContext', helmetContext.title)

    const html = ReactDOMServer.renderToString(
        <HtmlContext.Provider value={{
            // head,
            helmetContext,
            docComponentsRendered: {}
        }}>
            <Document />
        </HtmlContext.Provider>
    );

    return html.replace('<div id="reactica-app"></div>', `<div id="reactica-app">${content}</div>`)
}