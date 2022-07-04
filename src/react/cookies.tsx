import React, { createContext, useContext } from "react"
import UniversalCookies from 'universal-cookie';

type CookiesContext = {
    set: (key: string, value: any) => void
    get: (key: string) => any
    all: () => any
    remove: (key: string) => void
}

const CookiesContext = createContext<CookiesContext | null>(null);
// @ts-ignore
// import CookiesContext from 'virtual:reactica:context:cookies';
// import { initGlobal } from "./init-global";
// export const CookiesContext = initGlobal(
// 	"CookiesContext",
// 	createContext<{ params: Record<string, string> }>(undefined as any),
// );

export const CookiesProvider = ({ children, context }: { children: React.ReactNode, context: string | object | null }) => {
    const cookies = new UniversalCookies(context);
    const value = {
        set: (key: string, value: any): void => cookies.set(key, value, { path: '/' }),
        get: (key: string): any => cookies.get(key),
        all: (): any[] => cookies.getAll(),
        remove: (key: string): void => cookies.remove(key),
    }

    // @ts-ignore
    return <CookiesContext.Provider value={value}>{children}</CookiesContext.Provider>
}

export const useCookies = (): CookiesContext | null => {
    const context = useContext(CookiesContext)
    if (!context) throw Error('useCookies should be used within <CookiesProvider />')
    return context as any
}