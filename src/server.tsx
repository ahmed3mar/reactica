// @ts-nocheck
import { Suspense } from 'react'
import ReactDOM from 'react-dom'
import {
    Route,
    useRoutes,
    Routes,
} from 'react-router-dom'

// @ts-ignore
import loadPages from 'virtaul:reacticajs:pages-sync'
import {StaticRouter} from "react-router-dom/server";
import { RouterProvider } from './router';

function App({ context }) {
    const { routes, Wrapper } = loadPages(context)

    const pages = useRoutes(routes);

    return (
        <RouterProvider routes={pages}>
            <Wrapper>
                {pages}
            </Wrapper>
        </RouterProvider>
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

export const Application = ({context}: any) => {
    return (
        <StaticRouter location={context.url}>
            <App context={context} />
        </StaticRouter>
    )
}

export const server = (context) => {
    return () => {
        return (
            <Application context={context} />
        )
    }
}