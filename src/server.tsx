// @ts-nocheck
import { Suspense } from 'react'
import ReactDOM from 'react-dom'
import {
    Route,
    useRoutes,
    Routes,
} from 'react-router-dom'

import routes from '~react-pages'
import {StaticRouter} from "react-router-dom/server";

function App() {
    // return useRoutes(routes)

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

export const Application = ({context}: any) => {
    return (
        <StaticRouter location={context.url}>
            <App />
        </StaticRouter>
    )
}

export const server = (context, pages) => {
    return () => {
        return (
            <Application context={context} />
        )
    }
}