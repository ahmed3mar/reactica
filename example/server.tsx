import { Server, Routes, loadRoutes } from 'reactica'
import {renderToString} from "react-dom/server";
import{ StrictMode } from 'react'
import * as router from "react-router-dom";

const pages = import.meta.globEager('/src/pages/**/*.tsx')

export const routes = loadRoutes({}, pages)[1]

// export const render = async (url: string): Promise<string> => {
//     return server(pages, url)
// }


export const render = async (url: string, context: any): Promise<string> => {
    // const history = createMemoryHistory({ initialEntries: [url] })
    // const location = new ReactLocation({ history })
    // const router = new RouterInstance({ location, routes })
    // await router.updateLocation(location.current).promise

    return renderToString(
        <Server pages={pages} url={url} context={context} />
    )
}