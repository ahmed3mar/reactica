import React, { Fragment, lazy } from "react"
import { RouteProps } from 'react-router-dom'
import DocumentComponent from "./document";

import Guard, { Lazy } from "./guard";

const Application = ({Component, pageProps }: any) => {
    return <Component {...pageProps} />
}

Application.getInitialProps = async (ctx: any) => {
    let props = {}
    if (ctx?.Component?.getInitialProps) {
        props = await ctx?.Component?.getInitialProps(ctx);
    } else if (ctx?.getInitialProps) {
        props = await ctx?.getInitialProps(ctx);
    }
    return {
        pageProps: props,
    };
}

export const parseRoutes = (context: any, PRESERVED: any, ROUTES: any, LAYOUTS: any, lazyLoad: boolean = false) => {

    const preservedRoutes: Partial<Record<string, () => JSX.Element>> = Object.keys(PRESERVED).reduce((routes, key) => {
        const path = key.replace(/\/src\/pages\/|\.tsx$/g, '')
        return { ...routes, [path]: PRESERVED[key]?.default }
    }, {})

    const App = preservedRoutes?.['_app'] || Application
    const NotFound = preservedRoutes?.['404'] || Fragment
    const Wrapper = preservedRoutes?.['_wrapper'] || Fragment
    const Document = preservedRoutes?.['_document'] || DocumentComponent

    // @ts-ignore
    const middlewares = App.middlewares || {
        'auth': ({ pageProps, next, user, router }: any) => {
            if (!user) {
                return router.push('/login')
            }
            return true
        },
        'guest': ({ pageProps, next, user, router }: any) => {
            if (user) {
                return router.push('/')
            }
            return true
        },
    };

    // console.log('LAYOUTS', LAYOUTS)

    // const layouts = Object.keys(LAYOUTS).reduce<RouteProps[]>((routes, key) => {
    //     const module = ROUTES[key]

    //     let segments = key
    //         .replace(/\/src\/pages|\.tsx$/g, '')
    //         .replace(/\[\.{3}.+\]/, '*')
    //         .replace(/\[(.+)\]/, ':$1')
    //         .split('/')
    //         .filter(Boolean)
    //         .join('/')
    //         .replace(/index|\./g, '/');

    //     segments = ('/' + segments).replace(/\/\//g, '/')

    //     console.log('segmentssegmentssegments', segments)

    //     return routes

    // }, []);

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

        if (['_app', '_wrapper', '_document', '404'].includes(segments)) return routes

        if (segments.length > 1 && segments[segments.length - 1] == '/') {
            segments = segments.slice(0, -1);
        }

        const path = module.meta?.path || segments.replace(/index|\./g, '/')

        let component;
        let C;
        // = module?.default ? (!lazyLoad ? module.default : lazy(module.default)) : Fragment
        if (lazyLoad) {
            component = module
            C = Lazy;
        } else {
            component = module?.default || Fragment
            C = Guard;
        }

        const route: RouteProps = {
            // @ts-ignore
            component: component,
            element: (
                <C
                    app={App}
                    path={path}
                    context={context}
                    component={component}
                    lazyLoad={lazyLoad}
                    // component={lazy(module)}
                    {...(module?.meta || {})}
                    // module={module}
                    middlewares={middlewares}
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

        // const route: RouteProps = {
        //     // @ts-ignore
        //     component: module?.default || Fragment,
        //     // element: module().then((mod: any) => (mod?.default ? mod.default : <></>)),
        //     // element: !lazyLoad ? React.createElement(module.default) : React.lazy(module),
        //     // loader: (...args: any) => module().then((mod: any) => mod?.loader?.(...args)),
        // }

        // const segments = key
        //     .replace(/\/src\/pages|\.tsx$/g, '')
        //     .replace(/\[\.{3}.+\]/, '*')
        //     .replace(/\[(.+)\]/, ':$1')
        //     .split('/')
        //     .filter(Boolean)

        // segments.reduce((parent, segment, index) => {
        //     const path = module?.meta?.path || segment.replace(/index|\./g, '/')
        //     const root = index === 0
        //     const leaf = index === segments.length - 1 && segments.length > 1
        //     const node = !root && !leaf
        //     const insert = /^\w|\//.test(path) ? 'unshift' : 'push'

        //     console.log('pathpathpathpathpath ->path', parent, segment, index, path, insert)

        //     if (root) {
        //         const ignored = path.startsWith(':') || path === '*'
        //         if (ignored) return parent

        //         const last = segments.length === 1
        //         if (last) {
        //             routes[insert]({
        //                 path,
        //                 element: (
        //                     <Guard
        //                         app={App}
        //                         context={context}
        //                         path={path}
        //                         component={module.default}
        //                         {...(module?.meta || {})}
        //                         validScope={validScope}
        //                     />
        //                 ),
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
        //         // @ts-ignore
        //         else current?.[insert]({ path, children: [] })
        //         // @ts-ignore
        //         return found || (current?.[insert === 'unshift' ? 0 : current.length - 1] as RouteProps)
        //     }

        //     if (leaf) {
        //         // @ts-ignore
        //         parent?.children?.[insert]({ path, ...route })
        //     }

        //     return parent
        // }, {} as RouteProps)

        return routes
    }, [])

    const routes = [...regularRoutes, { path: '*', element: <NotFound /> }]

    return { App, NotFound, Wrapper, Document, routes };
    // return routes.map((item: any) => {
    //     console.log('item', item)
    //     const meta = item.element?.meta;
    //     if (meta) {
    //         item.path = (meta?.path && meta?.path[0] == '/' ? meta?.path.substring(1) : meta?.path) || item.path;
    //     }
    //     item.element = React.createElement(item.element.default);
    //     return item;
    // });
}
