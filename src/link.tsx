import React from "react";
import { Link as LinkComponent } from "react-router-dom";
import { routeByName } from "./routes";

interface LinkProps {
    to?: string;
    name?: string;
    children?: React.ReactNode;
    rest?: any;
}

const Link = ({ to, name, children, ...rest }: LinkProps) => {

    if (!to && name) {
        to = routeByName(name, rest);
        if (!to) {
            throw new Error(`Link: route with name "${name}" not found`);
        }
    }

    return (
        <LinkComponent to={to || ''} children={children} {...rest} />
    );
}

export default Link;