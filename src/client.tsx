import React, { Suspense } from 'react';
import { hydrate, render } from 'react-dom'

import {
  useRoutes,
  Routes,
  Route,
  BrowserRouter as Router,
} from 'react-router-dom'

// @ts-ignore
import loadPages from 'virtaul:reacticajs:pages-sync';
import { RouterProvider } from './router';

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

const { routes, Wrapper } = loadPages({ state: data });

function App() {

  console.log('routes', routes)

  // @ts-ignore
  const pages = useRoutes(routes);

  return (
    <RouterProvider routes={pages}>
      <Wrapper>
        {pages}
      </Wrapper>
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

export async function startClient() {
  const app = document.getElementById('page-view') as Element

  const application = (
    <Router>
      <App />
    </Router>
  );

  if (app.hasChildNodes()) hydrate(application, app)
  else render(application, app)
}