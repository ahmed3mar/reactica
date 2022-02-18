import React from "react";
import { useAuth } from "./auth";

const Guard = ({ component: Component, scope, validScope }: {
    component: any,
    scope: string | string[],
    validScope: any,
}) => {

    const auth = useAuth();

    const isValidScope = validScope({ user: auth?.user, scope: scope });

    if (typeof isValidScope === "boolean") {
        if (!isValidScope) {
            return (
                <div>
                    Not valid scope
                </div>
            )
        }
    } else {
        return isValidScope;
    }

    if (Component) return (
        <>
            <Component />
        </>
    )
    return (
        <div>
            GUARD
        </div>
    )
}

export default Guard;