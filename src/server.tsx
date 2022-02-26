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

import AmpStateContext from 'virtual:reacticajs:context:AmpState'
import HeadManagerContext from 'virtual:reacticajs:context:HeadManager'

let head: JSX.Element[] = [];//defaultHead(inAmpMode)

const pageConfig = {};
const query = {};

const ampState = {
    ampFirst: pageConfig.amp === true,
    hasQuery: Boolean(query.amp),
    hybrid: pageConfig.amp === 'hybrid',
}

function App({ context }) {
    const { routes, Wrapper } = loadPages(context)

    const pages = useRoutes(routes);

    return (
        <AuthProvider>
            <RouterProvider serverContext={context} routes={pages}>
                <AmpStateContext.Provider value={ampState}>
                    <HeadManagerContext.Provider

                        value={{
                            updateHead: (state) => {
                                head = state
                            },
                            updateScripts: (scripts) => {
                                scriptLoader = scripts
                            },
                            scripts: {},
                            mountedInstances: new Set(),
                        }}
                    >
                        <Wrapper>
                            {pages}
                        </Wrapper>
                    </HeadManagerContext.Provider>
                </AmpStateContext.Provider>
            </RouterProvider>
        </AuthProvider>
    );

    return (
        <Wrapper>
            <Routes>
                {routes.map(route => {
                    return (
                        <Route key={route.path} path={route.path} element={route.element} />
                    )
                })}
            </Routes>
        </Wrapper>
    );
    return useRoutes(routes)

    return (
        <Routes>
            {routes.map(route => {
                const Comp = route.element;
                return (
                    <Route key={route.path || '/'} path={'/' + (route.path || '')} element={
                        <Suspense fallback={null}>
                            <Comp />
                        </Suspense>
                    } />
                )
            })}
        </Routes>
    )
}

export const Application = ({ context }: any) => {
    return (
        <StaticRouter location={context.url}>
            <App context={context} />
        </StaticRouter>
    )
}

export const server = (context) => {
    return () => {
        return (
            <CookiesProvider context={context.cookies}>
                <Application context={context} />
            </CookiesProvider>
        )
    }
}

export const renderString = context => {
    const { routes, Document } = loadPages(context)

    const html = ReactDOMServer.renderToString(
        <HtmlContext.Provider value={{
            head,
            docComponentsRendered: {}
        }}>
            <Document />
        </HtmlContext.Provider>
    );

    const content = ReactDOMServer.renderToString(
        <CookiesProvider context={context.cookies}>
            <Application context={context} />
        </CookiesProvider>
    )

    return html.replace('<div id="reactica-app"></div>', `<div id="reactica-app">${content}</div>`)
}