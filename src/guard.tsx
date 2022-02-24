import React, { Fragment, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth";
import { useRouter } from "./router";

const isBrowser = typeof window !== 'undefined';
const AsyncFunction = (async () => { }).constructor;

const SSR = ({ app: App, component: Component, context = {}, path, ...props }: any) => {

    let { state = {}, ...otherContext } = context;

    const router = useRouter();

    let newState = state;
    newState = {};

    let doRequest = true;


    if (isBrowser && context) {
        context.url = router.pathname;

        // @ts-ignore
        if (window.__INITIAL_DATA === null) {

        } else {
            if (state.page !== path) {
                newState = {}
            } else if (context?.state) {
                newState = state.props;
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
        />
    )

    return (
        <Component loading={loading} {...data[location.pathname]} {...props} />
    )

}

const Guard = ({ context, app: App, component: Component, guard, validGuard }: {
    context: any,
    app: any,
    component: any,
    guard?: string | string[],
    validGuard: any,
}) => {

    const auth = useAuth();

    const isValidGuard = auth ? validGuard({ user: auth?.user, guard: guard }) : true;

    if (typeof isValidGuard === "boolean") {
        if (!isValidGuard) {
            return (
                <div>
                    Not valid guard
                </div>
            )
        }
    } else if (typeof isValidGuard === "string") {
        return (
            <Navigate to={isValidGuard} />
        );
    } else {
        return isValidGuard;
    }

    if (Component) return (
        <SSR
            app={App}
            component={Component}
            context={context}
        />
        // <Component />
    )

    //     console.log('Component', Component)

    return (
        <div>
            GUARD
        </div>
    )
}


export default Guard;