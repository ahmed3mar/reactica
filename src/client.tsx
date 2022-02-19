import React, { StrictMode } from 'react'
// import { hydrate, render } from 'react-dom'
import { Routes } from './routes';
import {BrowserRouter} from "react-router-dom";

export const Client = (props: any) => {
    return (
        <StrictMode>
            <BrowserRouter>
                <Routes {...props} />
            </BrowserRouter>
        </StrictMode>
    )
}

// const app = document.querySelector('#app') as Element

// if (app.hasChildNodes()) hydrate(<App />, app)
// else render(<App />, app)