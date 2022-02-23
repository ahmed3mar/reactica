// @ts-ignore
import routes from 'virtaul:reacticajs:pages-sync';

export const routeByName = (name: string, args: any): string => {
    // @ts-ignore
    const route = routes.find((route) => route.name === name)
    // @ts-ignore
    if (route && route?.name) {
        return (route.path || '').replace(/:.+/g, (match: any) => {
            const key = match.substring(1)
            return args[key]
        })
    }
    return route?.path || '';
}