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


// @ts-ignore
import AmpStateContext from 'virtual:reacticajs:context:AmpState'
// @ts-ignore
import HeadManagerContext from 'virtual:reacticajs:context:HeadManager'

let head: JSX.Element[] = [];//defaultHead(inAmpMode)

const pageConfig = {};
const query = {};

const ampState = {
  // @ts-ignore
  ampFirst: pageConfig.amp === true,
  // @ts-ignore
  hasQuery: Boolean(query.amp),
  // @ts-ignore
  hybrid: pageConfig.amp === 'hybrid',
}

function App({ loadPages }: any) {

  const { routes, Wrapper } = loadPages({ state: data });

  // @ts-ignore
  const pages = useRoutes(routes);

  return (
    <RouterProvider routes={pages}>
      <AmpStateContext.Provider value={ampState}>
        <HeadManagerContext.Provider

          value={{
            updateHead: (state: any) => {
              head = state

              console.log('state', state)
            },
            updateScripts: (scripts: any) => {
              // scriptLoader = scripts
            },
            scripts: {},
            mountedInstances: new Set(),
          }}
        >
          <AuthProvider>
            <Wrapper>
              {pages}
            </Wrapper>
          </AuthProvider>
        </HeadManagerContext.Provider>
      </AmpStateContext.Provider>
    </RouterProvider>
  );

  return (
    <Routes>
      {routes.map((route: any) => {
        const Comp = route.element;
        return (
          <Route key={route.path || '/'} path={'/' + (route.path || '')} element={
            <Suspense fallback={<div>loading</div>}>
              <Comp />
            </Suspense>
          } />
        )
      })}
    </Routes>
  )
}
import { HtmlContext } from './html-context';

export async function startClient(loadPages: any) {
  const app = document.getElementById('reactica-app') as Element

  const application = (
    <HtmlContext.Provider value={{
      head,
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