import React, { Fragment } from "react";
import { Link as LinkComponent } from "react-router-dom";
import { useRouter } from "./router";
// import { routeByName } from "./routes";

interface LinkProps {
    href?: string;
    name?: string;
    locale?: string;
    country?: string;
    children: React.ReactNode | React.ReactNode[];
    rest?: any;
}

const Link = ({ href, locale, country, name, children, ...rest }: LinkProps): any => {

    const router = useRouter();

    const { lang, nationality } = router.params;

    if (!href && name) {
        // @ts-ignore
        href = router.getRouteByName(name, rest);
        if (!href) {
            throw new Error(`Link: route with name "${name}" not found`);
        }
    }

    if (href?.startsWith("/") && lang && !href.startsWith(`/${lang}`)) {
        href = `/${lang}-${nationality}${href}`;
    }

    if (country && nationality) {
        // change lang with locale in href
        href = href?.replace(`/${lang}-${nationality}`, `/${lang}-${country}`)
    }

    if (locale && lang) {
        // change lang with locale in href
        href = href?.replace(`/${lang}-`, `/${locale}-`)
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
