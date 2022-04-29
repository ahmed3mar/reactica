import React, { createContext, useContext, useMemo } from 'react'
import {useLocation, useParams, useNavigate, NavigateFunction, To, NavigateOptions} from 'react-router-dom'

export { Routes } from 'react-router-dom'

type RouterContextProps = {
    routes: any,
}

// @ts-ignore
import RouterContext from "virtual:reacticajs:context:Router";

// const RouterContext = RC as RouterContextProps;

// const RouterContext = createContext<RouterContext | null>(null);

export const RouterProvider = ({ routes, children, serverContext }: { routes: any, children: React.ReactNode, serverContext?: any }) => {
    const value = //useMemo(
                  // () =>
        ({
            serverContext,
            routes,
            getRouteByName: (name: string, args: any) => {
                // @ts-ignore
                const route = routes.find((route) => route.name === name)
                // @ts-ignore
                if (route && route?.name) {
                    return (route.path || '').replace(/:.+/g, (match: any) => {
                        const key = match.substring(1)
                        return args[key]
                    })
                }
                return route?.path || '';
            }
        })//,
    //     [params]
    // )

    return (
        <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
    )

};

const isBrowser = typeof window !== 'undefined'

export class RedirectTo {
    to?: To

    constructor(context: any, to: To) {
        this.to = to;
        if (!isBrowser) context.serverContext.redirect = to;
    }
}

export const useRouter = () => {
    const context = useContext<RouterContextProps>(RouterContext)
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { url_locale } = params;
    if (url_locale) {
        console.log('url_localexxxurl_locale', url_locale)
    }

    if (!context) throw Error('useRouter should be used within <RouterProvider />')

    return {
        ...context,
        params,
        ...location,
        push: (to: To, options?: NavigateOptions) : void | RedirectTo => {
            if (isBrowser) navigate(to, options)
            else return new RedirectTo(context, to);
        },
        redirect: (to: To, options?: NavigateOptions) : void | RedirectTo => {
            return new RedirectTo(context, to);
        },
    }
}

// export declare type RouterProps<TGenerics extends PartialGenerics> = TGenerics;
export declare type RouterProps<TGenerics> = TGenerics;

export * from "./LocalizedRouter"
