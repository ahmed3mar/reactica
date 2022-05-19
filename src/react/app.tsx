import {Knave, useCurrentLocation} from "knave-react";
import React, { Suspense } from "react";

import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom'

// @ts-ignore
import routes from 'virtual:generated-pages';

export const App = () => {

    const renderRoutes = () => {
        return routes.map((route: any) => {
            const Comp = route.element;
            return (
                <Route path={route.path}>
                    {Comp}
                    {/*<Suspense fallback={<div>loading</div>}>*/}
                    {/*    <Comp />*/}
                    {/*</Suspense>*/}
                </Route>
            )
        })
    }

    return (
        <div>
            {renderRoutes()}
        </div>
    )

}