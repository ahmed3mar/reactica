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


function App({ loadPages }: any) {
  
  const { routes, Wrapper } = loadPages({ state: data });

  // @ts-ignore
  const pages = useRoutes(routes);

  return (
    <RouterProvider routes={pages}>
      <AuthProvider>
        <Wrapper>
          {pages}
        </Wrapper>
      </AuthProvider>
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

export async function startClient(loadPages: any) {
  const app = document.getElementById('reactica-app') as Element

  const application = (
      <CookiesProvider context={null}>
        <Router>
          <App loadPages={loadPages} />
        </Router>
      </CookiesProvider>
  );

  if (app.hasChildNodes()) hydrate(application, app)
  else render(application, app)
}