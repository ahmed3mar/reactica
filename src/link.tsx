import React, { Fragment } from "react";
import { Link as LinkComponent } from "react-router-dom";
import { useRouter } from "./router";
// import { routeByName } from "./routes";

interface LinkProps {
    href?: string;
    name?: string;
    children: React.ReactNode | React.ReactNode[];
    rest?: any;
}

const Link = ({ href, name, children, ...rest }: LinkProps) => {

    const router = useRouter();

    if (!href && name) {
        // @ts-ignore
        href = router.getRouteByName(name, rest);
        if (!href) {
            throw new Error(`Link: route with name "${name}" not found`);
        }
    }

    const childrenWithProps = React.Children.map(children, child => {
        // Checking isValidElement is the safe way and avoids a typescript
        // error too.
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onClick: (e: any) => {
                e.preventDefault();

                if (router.pathname === href) return false;

                router.push(href || '');
            },
            href,
          });
        }
        return child;
      });

    return childrenWithProps

    // return (
    //     <LinkComponent to={href || ''} children={children} {...rest} />
    // );
}

export default Link;