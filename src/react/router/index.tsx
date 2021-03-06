import React, { createContext, useContext, useMemo } from 'react'
import {useLocation, useParams, useNavigate, NavigateFunction, To, NavigateOptions} from 'react-router-dom'

export { Routes } from 'react-router-dom'

type RouterContextProps = {
    routes: any,
}

// @ts-ignore
import RouterContext from "virtual:reacticajs:router-context";

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

    const { url_locale = "" } = params;
    let { pathname } = location;

    let language = url_locale;
    if (/([a-zA-Z]){2}-([a-zA-Z]){2}/.test(url_locale)) {
        language = url_locale.split("-")[0];
    }

    if (url_locale) {
        pathname = pathname.replace(`/${url_locale}`, '');
    }

    if (!context) throw Error('useRouter should be used within <RouterProvider />')

    return {
        ...context,
        params,
        ...location,
        locale: url_locale,
        // @ts-ignore
        pathname,
        language,
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
