import React, { createContext, useMemo, useContext, useReducer } from "react"

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

const AuthContext = createContext<AuthContext | null>(null);

const initialState = {
    token: 'ddd',
    user: null,
};

const reducer = (state: typeof initialState, action: any) => {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                token: action.token,
                user: action.user,
            };
    }
    return state;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const value = useMemo(
        () => ({
            ...state,
            //   user,
            //   login: (email: string) => {
            //     setToken('token'), storage.set('token', 'a0731ae631bc01dea99f13b3f8ed48fc')
            //     setUser({ email }), storage.set('user', { email })
            //   },
            //   logout: () => {
            //     setToken(''), storage.remove('token')
            //     setUser(undefined), storage.remove('user')
            //   },
        }),
        []
        // [token, user]
    )

    // @ts-ignore
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContext | null => {
    const context = useContext(AuthContext)
    if (!context) return null;
    if (!context) throw Error('useAuth should be used within <AuthProvider />')
    return context
}