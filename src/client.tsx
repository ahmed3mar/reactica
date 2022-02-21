import React from 'react';
import { hydrate, render } from 'react-dom'

import {
    useRoutes,
    BrowserRouter as Router,
  } from 'react-router-dom'
  
  // @ts-ignore
  import routes from '~react-pages'

  function App() {
    return useRoutes(routes)
  }

export async function startClient() {

    console.log(' xxx x x  ')

    console.log('routes')

    const app = document.getElementById('reactica-app') as Element

    const application = (
        <Router>
    <App />
  </Router>
    );

    if (app.hasChildNodes()) hydrate(application, app)
    else render(application, app)
}