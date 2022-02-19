// import {Outlet, ReactLocation, Router} from "react-location";
import React, { Fragment, lazy, Suspense, useState } from 'react'
import { BrowserRouter, RouteProps, Route, Routes as RoutesRouter } from 'react-router-dom'
import Guard from './guard'
import { RouterProvider } from './router'

export const loadRoutes = (context: any, pages: any) => {
    // // @ts-ignore
    // const PRESERVED = loader('/src/pages/(_app|404).tsx')
    // // @ts-ignore
    // const ROUTES = loader('/src/pages/**/[a-z[]*.tsx')

    // @ts-ignore
    const PRESERVED = pages;
    // @ts-ignore
    const ROUTES = pages;

    const preservedRoutes: Partial<Record<string, () => JSX.Element>> = Object.keys(PRESERVED).reduce((routes, key) => {
        const path = key.replace(/\/src\/pages\/|\.tsx$/g, '')
        if (['_app', '_wrapper', '404'].includes(path)) return { ...routes, [path]: PRESERVED[key]?.default }
        return routes;
    }, {})

    const App = preservedRoutes?.['_app'] || Fragment
    const Wrapper = preservedRoutes?.['_wrapper'] || Fragment
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


        let segments = key
            .replace(/\/src\/pages|\.tsx$/g, '')
            .replace(/\[\.{3}.+\]/, '*')
            .replace(/\[(.+)\]/, ':$1')
            .split('/')
            .filter(Boolean)
            .join('/')
            .replace(/index|\./g, '/');

        segments = ('/' + segments).replace(/\/\//g, '/')

        if (['_app', '_wrapper', '404'].includes(segments)) return routes

        if (segments.length > 1 && segments[segments.length - 1] == '/') {
            segments = segments.slice(0, -1);
        }

        const path = module.meta?.path || segments.replace(/index|\./g, '/')

        const route: RouteProps = {
            // @ts-ignore
            component: module?.default ? module.default : Fragment,
            element: (
                <Guard
                app={App}
                path={path}
                context={context}
                    component={module?.default ? module.default : Fragment}
                    // component={lazy(module)}
                    {...(module?.meta || {})}
                    // module={module}
                    validScope={validScope}
                />
            ),
            // element: module().then((mod: any) => (mod?.default ? mod.default : <></>)),
            // loader: (...args: any) => module().then((mod: any) => mod?.loader?.(...args)),
        }

        routes.push({
            path,
            // @ts-ignore
            name: typeof module.meta?.name === "undefined" ? path.substring(1) : module.meta?.name,
            ...route
        })

        // segments.reduce((parent, segment, index) => {
        //     const path = module.meta?.path || segment.replace(/index|\./g, '/')
        //     const root = index === 0
        //     const leaf = index === segments.length - 1 && segments.length > 1
        //     const node = !root && !leaf
        //     const insert = /^\w|\//.test(path) ? 'unshift' : 'push'

        //     console.log('insertinsertinsertinsert', insert)

        //     if (root) {
        //         const ignored = path.startsWith(':') || path === '*'
        //         if (ignored) return parent

        //         const last = segments.length === 1
        //         if (last) {
        //             routes[insert]({
        //                 path,
        //                 // @ts-ignore
        //                 name: typeof module.meta?.name === "undefined" ? path.substring(1) : module.meta?.name,
        //                 ...route
        //             })
        //             return parent
        //         }
        //     }

        //     if (root || node) {
        //         const current = root ? routes : parent.children
        //         // @ts-ignore
        //         const found = current?.find((route) => route.path === path)
        //         if (found) found.children ??= []
        //         else current?.[insert]({ path, children: [] })
        //         // @ts-ignore
        //         return found || (current?.[insert === 'unshift' ? 0 : current.length - 1] as RouteProps)
        //     }

        //     if (leaf) {
        //         parent?.children?.[insert]({ path, ...route })
        //     }

        //     return parent
        // }, {} as RouteProps)

        return routes
    }, [])

    const routes = [...regularRoutes, {
        path: '*', element: (
            <Guard
                app={App}
                context={context}
                component={NotFound}
                // component={lazy(module)}
                // {...(module?.meta || {})}
                // module={module}
                validScope={validScope}
            />
        )
    }]

    return [Wrapper, routes];
}

// export const routeByName = (name: string, args: any): string => {
//     // @ts-ignore
//     const route = routes.find((route) => route.name === name)
//     // @ts-ignore
//     if (route && route?.name) {
//         return (route.path || '').replace(/:.+/g, (match) => {
//             const key = match.substring(1)
//             return args[key]
//         })
//     }
//     return route?.path || '';
// }


export const Routes = ({ context, pages, router }: any) => {
    const l = loadRoutes(context, pages)

    const Wrapper = l[0] || Fragment;
    const routes = l[1] || [];

    const renderRoutes = (prefix = '', routes: any) => {
        // @ts-ignore
        return routes.map(({ children, ...route }, index) => {

            // if (children) {
            //     const hasIndex = children.find((child: any) => child.path === '/');
            //     let child;
            //     if (hasIndex) {
            //         child = hasIndex.element;
            //     }

            //     return (
            //         <Route key={index} {...route} element={child}>
            //             {renderRoutes(route.path, children)}
            //         </Route>
            //     )
            // }

            // if (prefix && route.path == '/') return null;

            if (router) {
                return (
                    <router.Route key={index} {...route} />
                )
            }

            return <Route key={index} {...route} />
        })
    }

    const RouterWrapper = router ? router.Routes : RoutesRouter;

    return (
        <RouterProvider routes={routes}>
            {/* @ts-ignore */}
            <Wrapper>
                <RouterWrapper>
                    {
                        // @ts-ignore
                        renderRoutes('', routes)
                    }
                </RouterWrapper>
            </Wrapper>
        </RouterProvider>
    )
}