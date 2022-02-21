import React, { createContext, useContext, useMemo } from 'react'
import {useLocation, useParams} from 'react-router-dom'

type RouterContext = {
    routes: any,
}

const RouterContext = createContext<RouterContext | null>(null);

export const RouterProvider = ({ routes, children }: { routes: any, children: React.ReactNode }) => {
    const value = //useMemo(
                  // () =>
        ({
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

export const useRouter = () => {
    const context = useContext(RouterContext)
    const params = useParams();
    const location = useLocation();

    if (!context) throw Error('useRouter should be used within <RouterProvider />')
    return {
        ...context,
        params,
        ...location,
    }
}

// export declare type RouterProps<TGenerics extends PartialGenerics> = TGenerics;
export declare type RouterProps<TGenerics> = TGenerics;