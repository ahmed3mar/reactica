import React, { createContext, useMemo, useContext, useReducer, useEffect } from "react"
import { useCookies } from "./cookies";
// import { storage } from "./storage";

type User = {
    id: string
    name: string
    email: string
}

type AuthContext = {
    token: string | null
    user: User | null
    login: (token: string, user: User) => void
    logout: () => void
}

// @ts-ignore
import AuthContext from 'virtual:reacticajs:auth-context';

// const AuthContext = createContext<AuthContext | null>(null);

const initialState = {
    token: null,
    user: null,
};

const reducer = (state: typeof initialState, action: any) => {
    switch (action.type) {
        case "LOGIN":

            const { payload } = action;

            // storage.set('token', payload.token)
            // storage.set('user', payload.user)

            return {
                ...state,
                token: payload.token,
                user: payload.user,
            };

        case "LOGOUT":

            // storage.remove('token')
            // storage.remove('user')

            return {
                ...state,
                token: null,
                user: null,
            }
    }
    return state;
};

export const AuthProvider = ({ app, children }: { app: any, children: React.ReactNode }) => {

    const cookies = useCookies();
    if (cookies) {
        console.log('cookies', cookies.get('token'))
        initialState.token = cookies.get('token');
        initialState.user = cookies.get('user');
    }

    console.log('app', app.middlewares)

    const [state, dispatch] = useReducer(reducer, initialState)

    const value = useMemo(
        () => ({
          ...state,
        //   user,
          login: (email: string) => {
            dispatch({
                type: "LOGIN",
                payload: {
                    token: "a0731ae631bc01dea99f13b3f8ed48fc",
                    user: {
                        id: "1",
                        name: "John Doe",
                        email: email,
                    },
                }
            })
            if (cookies) cookies.set('token', 'a0731ae631bc01dea99f13b3f8ed48fc')
            if (cookies) cookies.set('user', {
                id: "1",
                name: "John Doe",
                email: email,
            })
            // setToken('token'), storage.set('token', 'a0731ae631bc01dea99f13b3f8ed48fc')
            // setUser({ email }), storage.set('user', { email })
          },
          logOut: () => {
            if (cookies) {
                cookies.remove('token')
                cookies.remove('user')
            }
            dispatch({
                type: "LOGOUT",
            })
          },
        }),
        [state.token, state.user]
        // [token, user]
      )

    // @ts-ignore
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

type UseAuthProps = {
    middleware?: string
}

export const useAuth = (): AuthContext | null => {
    const context = useContext(AuthContext)
    if (!context) return null;
    if (!context) throw Error('useAuth should be used within <AuthProvider />')


    // useEffect(() => {
    //     if (middleware === 'guest') {

    //     } else if (middleware === 'auth') {

    //     }
    // }, [])


    return context as AuthContext
}

export const Permission = ({ permissions, children }: {
    permissions: string[] | string,
    children: React.ReactNode
}) => {
    return (
        <>
        xxx
            {children}
        </>
    )
}