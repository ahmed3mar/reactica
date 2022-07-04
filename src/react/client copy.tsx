import React, { Fragment, Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import {
    useRoutes,
    Routes,
    Route,
    BrowserRouter as Router,
} from 'react-router-dom'

import { RouterProvider } from './router';
import { AuthProvider } from './auth';
import { HelmetProvider } from 'react-helmet-async';

// @ts-ignore
const data = window?.__INITIAL_DATA;

function App({ loadPages }: any) {
    // @ts-ignore
    const { routes, Wrapper, App, NotFound } = loadPages({ state: data, variables: window?.__REACTICA_VARS });

    console.log('routesroutesroutes", routes', routes)

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

    // @ts-ignore
    const pages = useRoutes(routes);

    let WrapperProps = {};
    if (typeof Wrapper === "object" && Wrapper instanceof Fragment) {
        // @ts-ignore
        WrapperProps = {
            routes: renderRoutes(routes),
            NotFound,
            context: {
                state: data,
                // @ts-ignore
                variables: window?.__REACTICA_VARS
            }
        };
    }

    return (
        <RouterProvider routes={pages}>
            {/* @ts-ignore */}
            <HelmetProvider>
                <AuthProvider app={App}>
                    <Wrapper {...WrapperProps}>
                        {pages}
                    </Wrapper>
                </AuthProvider>
            </HelmetProvider>
        </RouterProvider>
    );

}

export async function startClient(pack: string, loadPages: any) {
    const app = document.getElementById(`${pack}-app`) as Element

    const application = (
        <Router>
            <App loadPages={loadPages} />
        </Router>
    )
    // const application = (
    //   <HtmlContext.Provider value={{
    //     // head,
    //     docComponentsRendered: {}
    //   }}>
    //     <CookiesProvider context={document.cookie}>
    //       <Router>
    //         <App loadPages={loadPages} />
    //       </Router>
    //     </CookiesProvider>
    //   </HtmlContext.Provider>
    // );

    // if (app.hasChildNodes()) hydrateRoot(app, application)
    // else {
      const root = createRoot(app);
      root.render(application);
    // }

}