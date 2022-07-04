import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import type { UserOptions } from './lib/options'
import { getHtmlContent } from './lib/utils'
import path from 'path'

const resolve = (p: string) => path.resolve(process.cwd(), p)

const Reactica = (userOptions: UserOptions = {}): Plugin => {
    const options = {
        clientEntry: null,
        package: "reactica",
        pagesDir: 'src/pages',
        pages: {},
        data: {},
        ...userOptions,
    }

    let config: ResolvedConfig

    return {
        name: 'vite-plugin-reactica',
        configResolved(resolvedConfig) {
            config = resolvedConfig
        },
        config: (config) => {
            config.plugins?.push(Inspect());
            return config
        },

        configureServer(server: ViteDevServer) {
            // server.watcher.on('add', handleFileChange)
            // server.watcher.on('change', handleFileChange)
            // server.watcher.on('unlink', handleFileChange)

            // server.ssrLoadModule("reactica/client");

            return () => {
                server.middlewares.use(async (req, res, next) => {
                    // if not html, next it.
                    if (!req.url?.endsWith('.html')) {//} && req.url !== '/') {
                        return next()
                    }
                    let url = req.url

                    const templatePath = options.clientEntry
                        ? resolve(options.clientEntry)
                        : path.resolve(__dirname + "/index.html")

                    // console.log('templatePath', templatePath)

                    const isMPA = typeof config.build.rollupOptions.input !== 'string' && Object.keys(config.build.rollupOptions.input || {}).length > 0
                    let content = await getHtmlContent({
                        // pagesDir: options.pagesDir,
                        // pageName,
                        templatePath,
                        // pageEntry: page.entry || 'main',
                        // pageTitle: page.title || 'Home Page',
                        isMPA,
                        data: options.data,
                        entry: options.entry || '/src/main',
                        extraData: {
                            base: config.base,
                            url,
                        },
                    })

                    // using vite's transform html function to add basic html support
                    content = await server.transformIndexHtml?.(url, content, req.originalUrl)

                    res.end(content)
                })
            };
        },

        /**
         * for dev
         * @see {@link https://github.com/rollup/plugins/blob/master/packages/virtual/src/index.ts}
         */
        resolveId(id) {

            if (id === 'virtual:reactica:server') {
                return path.resolve(__dirname, '../react/server.tsx');
            } else if (
                id.startsWith(`/${options.package}:`) || id.startsWith(`virtual:reactica`)
            ) {
                return id;
            }
            
            // console.log('id', options.package)

            return null
        },

        /** for dev */
        load(id) {

            // console.log('load id', id);
            
                
            if (id === `/${options.package}:start.js`) {
                return `
                    import {startClient} from 'reactica/client'
                    import loadPages from 'virtual:reactica:pages-async';
                    startClient('${options.package}', loadPages)
                `
            }
            else if (id === `virtual:reactica:pages-async`) {
                return `
                    const PRESERVED = import.meta.globEager('/${options.pagesDir}/(_app|_wrapper|_document|404).(ts|tsx|js|jsx)')
                    const ROUTES = import.meta.glob('/${options.pagesDir}/**/[a-z[]*.(ts|tsx|js|jsx)')
                    const LAYOUTS = import.meta.glob('/${options.pagesDir}/**/_layout.(ts|tsx|js|jsx)')
                    import { parseRoutes } from 'reactica/routes';
                    export default (context) => parseRoutes(context, PRESERVED, ROUTES, LAYOUTS, true);
                `
            }
            else if (id === `virtual:reactica:pages-sync`) {
                return `
                    const PRESERVED = import.meta.globEager('/${options.pagesDir}/(_app|_wrapper|_document|404).(ts|tsx|js|jsx)')
                    const ROUTES = import.meta.globEager('/${options.pagesDir}/**/[a-z[]*.(ts|tsx|js|jsx)')
                    const LAYOUTS = import.meta.globEager('/${options.pagesDir}/**/_layout.(ts|tsx|js|jsx)')
                    import { parseRoutes } from 'reactica/routes';
                    export default (context) => parseRoutes(context, PRESERVED, ROUTES, LAYOUTS, false);
                `
            }
            else if (id === "virtual:reactica:context:html") {
                return `
                    import{ createContext } from "react"
                    const HtmlContext = createContext(null);
                    export default HtmlContext;
                `
            }
            else if (id === "virtual:reactica:context:router") {
                return `
                    import{ createContext } from "react"
                    const RouterContext = createContext(null);
                    export default RouterContext;
                `
            }
            else if (id.startsWith("virtual:reactica:context")) {
                return `
                    import{ createContext } from "react"
                    const Context = createContext(null);
                    export default Context;
                `
            }

            // console.log('----------->', id);
            // else  if (id.startsWith("virtual:reactica:context")) {
            //     const name = id.replace("virtual:reactica:context:", "")
            //     console.log('name', name)
            //     return `
            //         import{ createContext } from "react"
            //         const RouterContext = createContext(null);
            //         export default RouterContext;
            //     `
            // }
            
            return null
        },
        // transform(code, id) {

        //     // if (id === "virtual:reactica:context:auth") {
                
        //     //     return `
        //     //         alert("HI")
        //     //     `
        //     // }

        //     // if (id.includes("react/client.mjs")) {
        //     //     return `
        //     //         alert("dd")
        //     //     `
        //     // }

        //     return code
        // },

        /** for build */
        closeBundle() {
           
        },
    }
}

export default Reactica;