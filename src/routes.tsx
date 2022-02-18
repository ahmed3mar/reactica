// import {Outlet, ReactLocation, Router} from "react-location";
import React, { Fragment, lazy, Suspense } from 'react'
import { BrowserRouter, RouteProps, Route, Routes as RoutesRouter } from 'react-router-dom'
import Guard from './guard'

// @ts-ignore
const PRESERVED = import.meta.globEager('/src/pages/(_app|404).tsx')
// @ts-ignore
const ROUTES = import.meta.globEager('/src/pages/**/[a-z[]*.tsx')

const preservedRoutes: Partial<Record<string, () => JSX.Element>> = Object.keys(PRESERVED).reduce((routes, key) => {
    const path = key.replace(/\/src\/pages\/|\.tsx$/g, '')
    return { ...routes, [path]: PRESERVED[key]?.default }
}, {})

export const App = preservedRoutes?.['_app'] || Fragment
const NotFound = preservedRoutes?.['404'] || Fragment

// @ts-ignore
const validScope = App.validScope || (({ user, scope }): boolean => {
    if (!scope) return true;
    if (typeof scope === "string") scope = [scope];

    if (scope.includes("guest") && user) return false;
    if (!scope.includes("guest") && !user) return false;

    return true;
});

const regularRoutes = Object.keys(ROUTES).reduce<RouteProps[]>((routes, key) => {
    const module = ROUTES[key]

    const route: RouteProps = {
        element: (
            <Guard component={module.default} {...(module?.meta || {})} validScope={validScope} />
        ),
        // element: module().then((mod: any) => (mod?.default ? mod.default : <></>)),
        // loader: (...args: any) => module().then((mod: any) => mod?.loader?.(...args)),
    }

    const segments = key
        .replace(/\/src\/pages|\.tsx$/g, '')
        .replace(/\[\.{3}.+\]/, '*')
        .replace(/\[(.+)\]/, ':$1')
        .split('/')
        .filter(Boolean)

    segments.reduce((parent, segment, index) => {
        const path = module.meta?.path || segment.replace(/index|\./g, '/')
        const root = index === 0
        const leaf = index === segments.length - 1 && segments.length > 1
        const node = !root && !leaf
        const insert = /^\w|\//.test(path) ? 'unshift' : 'push'

        if (root) {
            const ignored = path.startsWith(':') || path === '*'
            if (ignored) return parent

            const last = segments.length === 1
            if (last) {
                routes[insert]({
                    path,
                    // @ts-ignore
                    name: typeof module.meta?.name === "undefined" ? path.substring(1) : module.meta?.name,
                    ...route
                })
                return parent
            }
        }

        if (root || node) {
            const current = root ? routes : parent.children
            // @ts-ignore
            const found = current?.find((route) => route.path === path)
            if (found) found.children ??= []
            else current?.[insert]({ path, children: [] })
            // @ts-ignore
            return found || (current?.[insert === 'unshift' ? 0 : current.length - 1] as RouteProps)
        }

        if (leaf) {
            parent?.children?.[insert]({ path, ...route })
        }

        return parent
    }, {} as RouteProps)

    return routes
}, [])

export const routes = [...regularRoutes, { path: '*', element: <NotFound /> }]

export const routeByName = (name: string, args: any): string => {
    // @ts-ignore
    const route = routes.find((route) => route.name === name)
    // @ts-ignore
    if (route && route?.name) {
        return (route.path || '').replace(/:.+/g, (match) => {
            const key = match.substring(1)
            return args[key]
        })
    }
    return route?.path || '';
}

export const Routes = () => {

    const renderRoutes = (routes: any) => {
        // @ts-ignore
        return routes.map(({ children, ...route }, index) => (
            children ? (
                <Route key={index} {...route}>
                    {renderRoutes(children)}
                </Route>
            ) : (
                <Route key={index} {...route} />
            )
        ))
    }

    return (
        <App>
            <RoutesRouter>
                {renderRoutes(routes)}
            </RoutesRouter>
        </App>
    )
}