import React, { Fragment, lazy } from "react"
import DocumentComponent from "./document";
import { RouteProps } from 'react-router-dom'

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

    console.log('Document', Document);
    
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

        

        return routes
    }, [])
    
    const routes = [...regularRoutes, { path: '*', element: <NotFound /> }]

    return { App, NotFound, Wrapper, Document, routes };
};