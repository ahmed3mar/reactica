import React, { useMemo, createContext, useContext, useEffect, useState } from "react"
import { useCookies } from "../cookies";

// import AuthContext from 'virtual:reactica:context:auth';

// import { initGlobal } from '../init-global';
// export const AuthContext = initGlobal(
// 	"AuthContext",
// 	createContext<{ params: Record<string, string> }>(undefined as any),
// );
type AuthContext = {
    // set: (key: string, value: any) => void
    // get: (key: string) => any
    // all: () => any
    // remove: (key: string) => void
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider = ({ app, children }: { app: any, children: React.ReactNode }) => {

    const cookies  = useCookies();
    // if (cookies) {
    //     initialState.token = cookies.get('token');
    //     // initialState.user = cookies.get('user');
    // }

    const [isChecked, setIsChecked] = useState(false);
    const [token, setToken] = useState(cookies?.get('token'));
    const [user, setUser] = useState<any>(null);

    const getUser = async (token: string) => {
        const user = await app.getUser(token);
        if (user) {
            setUser(user)
        } else {
            setToken(false);
            // @ts-ignore
            cookies?.remove('token');
            localStorage.removeItem('token');
        }

        setIsChecked(true);
    }

    useEffect(() => {
        if (token && app.getUser) {
            getUser(token)
        } else {
            setIsChecked(true);
        }
    }, []);

    // const [state, dispatch] = useReducer(reducer, initialState)

    const value = useMemo(
        () => ({
            token,
            user,
            isChecked,
        //   ...state,
        //   user,
          login: async (email: string, password: string) => {

            const user = await app.login({email, password})

            if (user) {
                cookies?.set("token", user.token)
                localStorage.setItem('token', user.token);
                setToken(user.token)
                setUser(user);
            }

            // dispatch({
            //     type: "LOGIN",
            //     payload: {
            //         token: "a0731ae631bc01dea99f13b3f8ed48fc",
            //         user: {
            //             id: "1",
            //             name: "John Doe",
            //             email: email,
            //         },
            //     }
            // })
            // if (cookies) cookies.set('token', 'a0731ae631bc01dea99f13b3f8ed48fc')
            // if (cookies) cookies.set('user', {
            //     id: "1",
            //     name: "John Doe",
            //     email: email,
            // })
            // setToken('token'), storage.set('token', 'a0731ae631bc01dea99f13b3f8ed48fc')
            // setUser({ email }), storage.set('user', { email })

        },
          logOut: () => {
            // if (cookies) {
            //     cookies.remove('token')
            //     cookies.remove('user')
            // }
            // dispatch({
            //     type: "LOGOUT",
            // })
          },
        }),
        [token, user, isChecked]
        // [token, user]
      )

    // if (!isChecked) return (
    //     <div>Auth Checking !</div>
    // )

    // @ts-ignore
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

type UseAuthProps = {
    middleware?: string
}

export const useAuth = (): any | null => {
    const context = useContext(AuthContext)
    if (!context) return null;
    if (!context) throw Error('useAuth should be used within <AuthProvider />')


    // useEffect(() => {
    //     if (middleware === 'guest') {

    //     } else if (middleware === 'auth') {

    //     }
    // }, [])


    return context as any
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