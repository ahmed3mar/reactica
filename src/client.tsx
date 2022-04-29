import React, { Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import {
  useRoutes,
  Routes,
  Route,
  BrowserRouter as Router,
} from 'react-router-dom'

// @ts-ignore
import { RouterProvider } from './router';
import { AuthProvider } from './auth';
import { CookiesProvider } from './cookies';

import { HtmlContext } from './html-context';
import { HelmetProvider } from 'react-helmet-async';

// export const RoutesX = () => {

//   const renderRoutes = (routes: any) => {
//       // @ts-ignore
//       return routes.map(({ children, ...route }, index) => (
//           children ? (
//               <Route key={index} {...route}>
//                   {renderRoutes(children)}
//               </Route>
//           ) : (
//               <Route key={index} {...route} />
//           )
//       ))
//   }

//   return (
//       <App>
//           <RoutesRouter>
//               {renderRoutes(routes)}
//           </RoutesRouter>
//       </App>
//   )
// }

// @ts-ignore
const data = window?.__INITIAL_DATA;

function App({ loadPages }: any) {

  const { routes, Wrapper, App, NotFound } = loadPages({ state: data });

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

  return (
    <RouterProvider routes={pages}>
      {/* @ts-ignore */}
      <HelmetProvider>
        <AuthProvider app={App}>
          <Wrapper routes={renderRoutes(routes)} NotFound={NotFound}>
            {pages}
          </Wrapper>
        </AuthProvider>
      </HelmetProvider>
    </RouterProvider>
  );

}

export async function startClient(loadPages: any) {
  const app = document.getElementById('reactica-app') as Element
  const application = (
    <HtmlContext.Provider value={{
      // head,
      docComponentsRendered: {}
    }}>
      <CookiesProvider context={document.cookie}>
        <Router>
          <App loadPages={loadPages} />
        </Router>
      </CookiesProvider>
    </HtmlContext.Provider>
  );

  // if (app.hasChildNodes()) hydrateRoot(app, application)
  // else {
    const root = createRoot(app);
    root.render(application);
  // }
}
