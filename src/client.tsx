import React, { Suspense } from 'react';
import { hydrate, render } from 'react-dom'

import {
  useRoutes,
  Routes,
  Route,
  BrowserRouter as Router,
} from 'react-router-dom'

// @ts-ignore
import routes from '~react-pages'

function App() {
//   return useRoutes(routes)
  
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

  console.log(' xxx x x  ')

  console.log('routes', routes)

  const app = document.getElementById('page-view') as Element

  const application = (
    <Router>
      <App />
    </Router>
  );

  if (app.hasChildNodes()) hydrate(application, app)
  else render(application, app)
}