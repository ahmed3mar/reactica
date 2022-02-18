import React, { Fragment, Suspense, useEffect, useState } from "react";
import { useAuth } from "./auth";

const Guard = ({ component: Component, scope, validScope }: {
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
        <Component />
    )

    //     console.log('Component', Component)

    return (
        <div>
            GUARD
        </div>
    )
}

// @ts-ignore
// const GuardLazy = ({ module, validScope }) => {

//     const [component, setComponent] = useState(null);

//     useEffect(() => {
//         module().then((mod: any) => {
//             setComponent(mod?.default ? mod.default : Fragment);
//         })
//     }, [module])

//     if (component) {

//         const OtherComponent = React.lazy(component);

//         return (
//             <Suspense fallback={<div>Loading...</div>}>
//                 {/* @ts-ignore */}
//                 xxx
//                 <OtherComponent />
//             </Suspense>
//         )
//         return (
//             // @ts-ignore
//             <Component />
//         )
//     }

//     return (
//         <div>
//             loading !!
//         </div>
//     )

//     // const comp = useState(() => module());
//     // console.log('comp', comp)

//     // // const OtherComponent = React.lazy(() => import('./OtherComponent'));

//     // return (
//     //     <Suspense fallback={<div>Loading...</div>}>
//     //         {/* <OtherComponent /> */}
//     //     </Suspense>
//     // )
// }

export default Guard;