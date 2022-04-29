import React, { Fragment, lazy, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import { useRouter, RedirectTo } from "./router";

const isBrowser = typeof window !== 'undefined';
const AsyncFunction = (async () => { }).constructor;

export const Lazy = ({ component, ...props }: any) => {

    const [data, setData] = useState<any>(null);
    const router = useRouter();

   useEffect(() => {
        component().then((r: any) => {
            setData({
                Component: r.default,
                meta: r?.meta || {},
            });
        })
   }, [router.pathname])

   if (!data) return <div></div>;

    return (
        <Guard component={data.Component} {...props} {...data.meta} />
    )
}

const SSR = ({ app: App, component: Component, context = {}, path, ...props }: any) => {

    let { state = {}, ...otherContext } = context;

    const router = useRouter();

    let newState = state;
    newState = {};

    let doRequest = true;


    console.log('-----------a-XXXX', isBrowser, context)
    if (isBrowser && context) {
        context.url = router.pathname;
        // @ts-ignore
        console.log('111111', state.page, router.pathname, path)
        // @ts-ignore
        if (window.__INITIAL_DATA === null) {

        } else {
            if (state.page !== path) {
                newState = {}
            } else if (context?.state) {
                console.log('----------->', context?.state)
                newState = context?.state?.props;
                // @ts-ignore
                doRequest = false;
            }
            // if (index != state?.index) {
            //     newState = {}
            // } else {
            //     newState = { ...state };
            //     // @ts-ignore
            //     window.__INITIAL_DATA = null;
            //     doRequest = false;
            // }
        }

    } else if (!isBrowser && context) {
        if (state.page !== path) {
            newState = {}
        } else {
            newState = state.props;
        }
    }

    // console.log('newState-->newState', context, isBrowser, newState)

    // const params = useParams();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        [router.pathname]: newState,
    });

    const getInitialPropsComponentProps = {
        err: undefined,
        req: '',
        res: '',

        pathname: '/',
        query: {},
        asPath: '/',
        locale: undefined,
        locales: undefined,
        defaultLocale: undefined,
        // AppTree: [Function: AppTree],
        // defaultGetInitialProps: [AsyncFunction: defaultGetInitialProps]
    }

    const getInitialPropsAppProps = {
        // AppTree: [Function: AppTree],
        Component,
        // Component: [Function: Home] { getInitialProps: [AsyncFunction (anonymous)] },
        router:  {
            route: '/',
            pathname: '/',
            query: {},
            asPath: '/',
            isFallback: false,
            basePath: '',
            locale: undefined,
            locales: undefined,
            defaultLocale: undefined,
            isReady: true,
            domainLocales: undefined,
            isPreview: false,
            isLocaleDomain: false
        },
        cts: getInitialPropsComponentProps
    }

    useEffect(() => {
        if (isBrowser && context) {

            context.url = location.pathname;
            // @ts-ignore
            window.__INITIAL_DATA = null;

            if (state.page !== path || doRequest) {
                // @ts-ignore
                newState = {}

                const getInitialProps = App.getInitialProps || (async () => {
                    if (Component.getInitialProps) return await Component.getInitialProps(getInitialPropsComponentProps);
                })

                if (getInitialProps) {
                    setLoading(true);
                    if (getInitialProps instanceof AsyncFunction === true) {
                        getInitialProps(getInitialPropsAppProps)
                            .then((d: any) => {
                                setData({
                                    [router.pathname]: d,
                                });
                                setLoading(false);
                            })
                            .catch(() => {
                                setLoading(false);
                            })
                    } else {
                        const res = getInitialProps(getInitialPropsAppProps);
                        setLoading(false);
                        setData({
                            [router.pathname]: res,
                        });
                    }
                }

                // if (route.ssr) {
                //     setLoading(true);
                //     if (route.ssr instanceof AsyncFunction === true) {
                //         route.ssr(params, location)
                //             .then(res => {
                //                 setLoading(false);
                //                 setData(res);
                //             })
                //             .catch(err => {
                //                 setLoading(false);
                //             })
                //     } else {
                //         const res = route.ssr(params, location);
                //         setLoading(false);
                //         setData(res);
                //     }
                // }

            } else {
                newState = state;
            }
        }


    }, [isBrowser ? router.pathname : null]);

    return (
        <App
            loading={loading}
            pageProps={data[router.pathname] || {}}
            Component={Component}
            router={router}
        />
    )

    return (
        <Component loading={loading} {...data[location.pathname]} {...props} />
    )

}

const Guard = ({
    context, app: App, component: Component, middleware, middlewares, ...other }: {
    context: any,
    app: any,
    component: any,
    middleware?: string | string[],
    middlewares: any,
}) => {

    const auth = useAuth();
    const router = useRouter();

    const middleware_list = (typeof middleware === "string") ? [middleware] : (middleware || []);

    const [authChecked, setAuthChecked] = useState(!isBrowser || !middleware_list.length)


    if (middleware_list.length && !middleware_list?.every((m: string) => middlewares[m])) {
        console.warn(`You have to define all the middlrwares in _app ${JSON.stringify(middleware_list)} and in _app ${JSON.stringify(Object.keys(middlewares))}`);
    }

    if (!isBrowser) {
        middleware_list.map(middle => {
            const the_middle = middlewares[middle] && middlewares[middle]({
                middleware,
                ...other,
                user: auth?.user, context: context, router, redirect: router.redirect,
            });
            // console.log('the_middle', middle, the_middle, typeof the_middle, the_middle instanceof RedirectTo)
        })
    }

    useEffect(() => {

        if (isBrowser) {
            setAuthChecked(!middleware_list.length)

            for (let i = 0; i < middleware_list.length; i++) {
                const middle = middleware_list[i];
                const the_middle = middlewares[middle] ? middlewares[middle]({
                    middleware,
                    ...other,
                    user: auth?.user, context: context, router, redirect: router.redirect
                }) : true;
                // console.log('the_middle', the_middle)
                if (the_middle === true) {
                    setAuthChecked(true);
                } else if (the_middle) {
                    setAuthChecked(the_middle);
                }

                // console.log('the_middle', middle, the_middle)
            }
        }
        // middleware_list.map(middle => {
        //     const the_middle = middlewares[middle]({ user: auth?.user, context: context, router, redirect: router.push });
        //     console.log('the_middle', middle, the_middle, typeof the_middle, the_middle instanceof RedirectTo)
        // })
    }, [Component, router.pathname, auth?.user])

    // console.log('authChecked', authChecked, router.pathname)

    // const isValidGuard = auth ? validGuard({ user: auth?.user, guard: guard }) : true;

    // if (typeof isValidGuard === "boolean") {
    //     if (!isValidGuard) {
    //         return (
    //             <div>
    //                 Not valid guard
    //             </div>
    //         )
    //     }
    // } else if (typeof isValidGuard === "string") {
    //     return (
    //         <Navigate to={isValidGuard} />
    //     );
    // } else {
    //     return isValidGuard;
    // }

    if (!authChecked) return null


    if (authChecked !== true) {
        return authChecked
    }

    if (Component) {
        return (
            <SSR
                app={App}
                component={Component}
                context={context}
            />
            // <Component />
        )
    }

    //     console.log('Component', Component)

    return (
        <div>
            GUARD
        </div>
    )
}


export default Guard;
