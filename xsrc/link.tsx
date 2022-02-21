import React from "react";
import { Link as LinkComponent } from "react-router-dom";
import { useRouter } from "./router";
// import { routeByName } from "./routes";

interface LinkProps {
    to?: string;
    name?: string;
    children?: React.ReactNode;
    rest?: any;
}

const Link = ({ to, name, children, ...rest }: LinkProps) => {

    const router = useRouter();

    if (!to && name) {
        // @ts-ignore
        to = router.getRouteByName(name, rest);
        if (!to) {
            throw new Error(`Link: route with name "${name}" not found`);
        }
    }

    return (
        <LinkComponent to={to || ''} children={children} {...rest} />
    );
}

export default Link;