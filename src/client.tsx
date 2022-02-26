import React, { Suspense } from 'react';
import { hydrate, render } from 'react-dom'

import {
  useRoutes,
  Routes,
  Route,
  BrowserRouter as Router,
} from 'react-router-dom'

// @ts-ignore
// import loadPages from 'virtual:reacticajs:pages-sync';
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

  const { routes, Wrapper } = loadPages({ state: data });

  // @ts-ignore
  const pages = useRoutes(routes);

  return (
    <RouterProvider routes={pages}>
      <HelmetProvider>

        <AuthProvider>
          <Wrapper>
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
      <CookiesProvider context={null}>
        <Router>
          <App loadPages={loadPages} />
        </Router>
      </CookiesProvider>
    </HtmlContext.Provider>
  );

  if (app.hasChildNodes()) hydrate(application, app)
  else render(application, app)
}