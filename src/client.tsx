import React, { StrictMode } from 'react'
import { hydrate, render } from 'react-dom'
import { Routes } from './routes';
import {BrowserRouter} from "react-router-dom";

const App = () => {
    return (
        <StrictMode>
            <BrowserRouter>
                <Routes />
            </BrowserRouter>
        </StrictMode>
    )
}

const app = document.querySelector('#app') as Element

if (app.hasChildNodes()) hydrate(<App />, app)
else render(<App />, app)