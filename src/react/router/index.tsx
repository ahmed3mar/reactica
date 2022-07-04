import React, { createContext, useContext, useMemo } from 'react'
import {useLocation, useParams, useNavigate, NavigateFunction, To, NavigateOptions} from 'react-router-dom'

export { Routes } from 'react-router-dom'

type RouterContextProps = {
    routes: any,
}

// @ts-ignore
// import RouterContext from "virtual:reactica:context:router";

// const RouterContext = RC as RouterContextProps;

const RouterContext = createContext<RouterContext | null>(null);

export const RouterProvider = ({ routes, children, serverContext }: { routes: any, children: React.ReactNode, serverContext?: any }) => {

    return (
        <RouterContext.Provider value={{}}>XX</RouterContext.Provider>
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