import React, { Fragment, Suspense, useEffect, useState } from "react";
import { useAuth } from "./auth";

const isBrowser = typeof window !== 'undefined';
const AsyncFunction = (async () => { }).constructor;

const SSR = ({ app: App, component: Component, context, path, ...props }: any) => {

    let { state, ...otherContext } = context;

    let newState = state;
    newState = {};

    let doRequest = true;

    if (isBrowser) {
        context.url = location.pathname;

        // @ts-ignore
        if (window.__INITIAL_DATA === null) {

        } else {
            if (!state[path]) {
                newState = {}
            } else {
                newState = {...state[path]};
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

    }

    // const params = useParams();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(newState);

    useEffect(() => {
        if (isBrowser) {

            context.url = location.pathname;
            // @ts-ignore
            window.__INITIAL_DATA = null;

            if (!state[path] || doRequest) {
                // @ts-ignore
                newState = {}

                const getInitialProps = App.getInitialProps || (async () => {
                    if (Component.getInitialProps) return await Component.getInitialProps();
                })

                if (getInitialProps) {
                    setLoading(true);
                    if (getInitialProps instanceof AsyncFunction === true) {
                        getInitialProps(Component)
                            .then((d: any) => {
                                setData(d);
                                setLoading(false);
                            })
                            .catch(() => {
                                setLoading(false);
                            })
                    } else {
                        const res = getInitialProps(Component);
                        setLoading(false);
                        setData(res);
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


    }, [isBrowser ? location.pathname : null]);

    return (
        <App
            loading={loading}
            pageProps={data}
            Component={Component}
        />
    )

    return (
        <Component loading={loading} {...data} {...props} />
    )

}

SSR.ahmed = () => {

}

const Guard = ({ context, app: App, component: Component, scope, validScope }: {
    context: any,
    app: any,
    component: any,
    scope?: string | string[],
    validScope: any,
}) => {

    const auth = useAuth();

    const isValidScope = auth ? validScope({ user: auth?.user, scope: scope }) : true;

    if (typeof isValidScope === "boolean") {
        if (!isValidScope) {
            return (
                <div>
                    Not valid scope
                </div>
            )
        }
    } else {
        return isValidScope;
    }

    if (Component) return (
        <SSR
            App={App}
            Component={Component}
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


export default SSR;