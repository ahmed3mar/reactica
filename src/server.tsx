import React, { StrictMode } from 'react'
// import { createMemoryHistory, ReactLocation, RouterInstance } from 'react-location'
import { StaticRouter } from "react-router-dom/server";

import { Routes as RoutesComponent, loadRoutes as routesList } from './routes'
// routes as routesList
export const loadRoutes = routesList;
export const Routes = RoutesComponent;

export const Server = ({pages, url, context}: any) => {
    // const history = createMemoryHistory({ initialEntries: [url] })
    // const location = new ReactLocation({ history })
    // const router = new RouterInstance({ location, routes })
    // await router.updateLocation(location.current).promise

    return (
        <StrictMode>
            <StaticRouter location={url}>
                <Routes context={context} pages={pages} />
            </StaticRouter>
        </StrictMode>
    )
}