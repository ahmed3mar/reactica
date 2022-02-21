import React from "react";
import { renderToString } from "react-dom/server";
// @ts-ignore
import SSRMode from "virtual:reacticajs:servers";

export const handleRequest = () => {
    return renderToString(
        <SSRMode>
            Hi
        </SSRMode>
    )
}