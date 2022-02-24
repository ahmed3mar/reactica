// @ts-nocheck
import { Suspense } from 'react'
import ReactDOM from 'react-dom'
import {
    Route,
    useRoutes,
    Routes,
} from 'react-router-dom'

// @ts-ignore
import loadPages from 'virtual:reacticajs:pages-sync'
import {StaticRouter} from "react-router-dom/server";
import { RouterProvider } from './router';
import { AuthProvider } from './auth';
import { CookiesProvider } from './cookies';

function App({ context }) {
    const { routes, Wrapper } = loadPages(context)

    const pages = useRoutes(routes);

    return (
        <AuthProvider>
        <RouterProvider routes={pages}>
                <Wrapper>
                    {pages}
                </Wrapper>
        </RouterProvider>
            </AuthProvider>
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
            <CookiesProvider context={context.cookies}>
                <Application context={context} />
            </CookiesProvider>
        )
    }
}