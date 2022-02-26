import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite'
import type { UserOptions } from './lib/options'
import path from 'path'
// import shell from 'shelljs'
import { last } from 'lodash'
import { getHtmlContent } from './lib/utils'

import Inspect from 'vite-plugin-inspect'
// import Pages from 'vite-plugin-pages'

const resolve = (p: string) => path.resolve(process.cwd(), p)
// must src to corresponding with vite-plugin-mpa#closeBundle hook
const PREFIX = 'src'

function htmlTemplate(userOptions: UserOptions = {}): Plugin {
    const options = {
        clientEntry: null,
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
            // config.plugins?.push(Pages({
            //     importMode: "async",
            //     // dirs: [
            //     //   { dir: "src/pages", baseRoute: "" },
            //     //   { dir: "src/features/**/pages", baseRoute: "features" },
            //     //   { dir: "src/admin/pages", baseRoute: "admin" },
            //     // ],
            //     pagesDir: 'src/pages',
            // }));

            return config
        },
        /**
         * for dev
         * if SPA, just use template and write script main.{js,ts} for /{entry}.html
         * if MPA, check pageName(default is index) and write /${pagesDir}/{pageName}/${entry}.html
         */
        configureServer(server: ViteDevServer) {
            return () => {
                server.middlewares.use(async (req, res, next) => {
                    // if not html, next it.
                    if (!req.url?.endsWith('.html')){//} && req.url !== '/') {
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
            }
        },
        /**
         * for dev
         * @see {@link https://github.com/rollup/plugins/blob/master/packages/virtual/src/index.ts}
         */
        resolveId(id) {
            if (id.endsWith('.html')) {
                const isMPA = typeof config.build.rollupOptions.input !== 'string' && Object.keys(config.build.rollupOptions.input || {}).length > 0
                
                if (!isMPA) {
                    return `${PREFIX}/${path.basename(id)}`
                } else {
                    const pageName = last(path.dirname(id).split('/')) || ''
                    if (pageName in (config.build.rollupOptions.input as any)) {
                        return `${PREFIX}/${options.pagesDir.replace('src/', '')}/${pageName}/index.html`
                    }
                }
            } else if (id === "/reactica:start.js") {
                return "reactica:start.js";
            }
             else if (id === "virtual:reacticajs:server") {
                // TODO fix this
                console.log('===================>', path.resolve(__dirname, '../../server.js'))
                return path.resolve(__dirname, '../../../src/server.tsx');
            } else if (id === "virtual:reacticajs:cookies-context") {
                return "virtual:reacticajs:cookies-context";
            } else if (id === "virtual:reacticajs:html-context") {
                return "virtual:reacticajs:html-context";
            } else if (id === "virtual:reacticajs:auth-context") {
                return "virtual:reacticajs:auth-context";
            } else if (id === "virtual:reacticajs:context") {
                return "virtual:reacticajs:context";
            } else if (id.startsWith("virtual:reacticajs:context:")) {
                return id
            } else if (id == "virtual:reacticajs:side-effect") {
                return path.resolve(__dirname, '../../../src/side-effect.tsx');
            }

            else if (["virtual:reacticajs:pages-sync", "virtual:reacticajs:pages-async"].includes(id)) {
                return id;
            }

            return null
        },
        /** for dev */
        load(id) {

            if (id.startsWith("virtual:reacticajs:context:")) {
                const vara = id.replace("virtual:reacticajs:context:", "");
                return `
                    import{ createContext } from "react"
                    const ${vara}Context = createContext(null);
                    export default ${vara}Context;
                `
            } else if (id === "virtual:reacticajs:cookies-context") {
                return `
                import{ createContext } from "react"
                const CookiesContext = createContext(null);
                export default CookiesContext;
                `
            } else if (id === "virtual:reacticajs:auth-context") {
                return `
                import{ createContext } from "react"
                const AuthContext = createContext(null);
                export default AuthContext;
                `
            } else if (id === "virtual:reacticajs:html-context") {
                return `
                import{ createContext } from "react"
                const HtmlContext = createContext(null);
                export default HtmlContext;
                `
            } else if (id === "virtual:reacticajs:context") {
                return `
import React, { useContext, createContext } from 'react';
export function useCreateContext<StateType, ActionType>(
  reducer: React.Reducer<StateType, ActionType>,
  initialState: StateType
) {
  const defaultDispatch: React.Dispatch<ActionType> = () => initialState;
  const stateCtx = createContext(initialState);
  const dispatchCtx = createContext(defaultDispatch);

  function useStateCtx<K extends keyof StateType>(property: K) {
    const state = useContext(stateCtx);
    return state[property]; // only one depth selector for comparison
  }

  function useDispatchCtx() {
    return useContext(dispatchCtx);
  }

  function Provider(props: React.PropsWithChildren<{}>) {
    const [state, dispatch] = React.useReducer<
      React.Reducer<StateType, ActionType>
    >(reducer, initialState);
    return (
      <dispatchCtx.Provider value={dispatch}>
        <stateCtx.Provider value={state}>{props.children}</stateCtx.Provider>
      </dispatchCtx.Provider>
    );
  }
  return [useStateCtx, useDispatchCtx, Provider] as const;
}

// const [useTextState, useTextDispatch, TextProvider] = useCreateContext(initialState, reducer);
// export const TextContext = ctx;
// export function App() {
//   return (
//     <TextProvider>
//       <Component />
//     </TextProvider>
//   )
// }
// export function Component() {
//   const state = useTextState('state')
//   const dispatch = useTextDispatch()
// const increment = useCallback(() => dispatch({ type: 'increment' }), [dispatch]);
//   return (
//     <div>
//       {state}
//       <button onClick={increment}>Toggle</button>
//     </div>
//   )
// }
                `
            } else
            if (id.startsWith(PREFIX)) {
                const idNoPrefix = id.slice(PREFIX.length)
                const pageName = path.basename(id).replace('.html', '')

                const page = options.pages[pageName] || {}
                const templateOption = page.template
                const templatePath = templateOption ? resolve(templateOption) : resolve('public/index.html')

                const isMPA = typeof config.build?.rollupOptions.input !== 'string' && Object.keys(config.build?.rollupOptions.input || {}).length > 0
                return getHtmlContent({
                    // pagesDir: options.pagesDir,
                    // pageName,
                    templatePath,
                    // pageEntry: page.entry || 'main',
                    // pageTitle: page.title || 'Home Page',
                    isMPA,
                    extraData: {
                        base: config.base,
                        url: isMPA ? idNoPrefix : '/',
                    },
                    data: options.data,
                    entry: options.entry || '/src/main',
                })
            } else if (id === "reactica:start.js") {
                return `
                    import {startClient} from 'reactica/client'
                    import loadPages from 'virtual:reacticajs:pages-sync';
                    startClient(loadPages)
                `
            } else if (id === "virtual:reacticajs:server") {
                // return `
                //     import { Suspense } from 'react'
                //     import ReactDOM from 'react-dom'
                //     import {
                //         BrowserRouter as Router,
                //         Route,
                //         Routes,
                //     } from 'react-router-dom'
                //
                //     import routes from '~react-pages'
                //
                //     function App() {
                //         return useRoutes(routes)
                //     }
                //
                //     const Application = () => {
                //         return (
                //             <Router>
                //                 <App />
                //             </Router>
                //         )
                //     }
                //
                //     export default App;
                // `
            } else if (id === "virtual:reacticajs:pages-sync") {
                return `
                    const PRESERVED = import.meta.globEager('/src/pages/(_app|_wrapper|_document|404).(ts|tsx|js|jsx)')
                    const ROUTES = import.meta.globEager('/src/pages/**/[a-z[]*.(ts|tsx|js|jsx)')
                    import { parseRoutes } from 'reactica/routes';

                    export default (context) => parseRoutes(context, PRESERVED, ROUTES, false);
                `
            } else if (id === "virtual:reacticajs:pages-async") {
                return `
                    const PRESERVED = import.meta.globEager('/src/pages/(_app|_wrapper|_document|404).(ts|tsx|js|jsx)')
                    const ROUTES = import.meta.glob('/src/pages/**/[a-z[]*.(ts|tsx|js|jsx)')

                    import { parseRoutes } from 'reactica/routes';

                    const { routes, App, Wrapper } = parseRoutes(PRESERVED, ROUTES, true);
                    export {
                        App, Wrapper
                    };
                    export default routes;
                `
            }

            return null
        },
        /** for build */
        closeBundle() {
            // const isMPA = typeof config.build?.rollupOptions.input !== 'string' && Object.keys(config.build?.rollupOptions.input || {}).length > 0
            // // MPA handled by vite-plugin-mpa
            // if (!isMPA) {
            //     const root = config.root || process.cwd()
            //     const dest = (config.build && config.build.outDir) || 'dist'
            //     const resolve = (p: string) => path.resolve(root, p)
            //
            //     // 1. move src/*.html to dest root
            //     shell.mv(resolve(`${dest}/${PREFIX}/*.html`), resolve(dest))
            //     // 2. remove empty src dir
            //     shell.rm('-rf', resolve(`${dest}/${PREFIX}`))
            // }
        },
    }
}

export default function framework(config: any) {
    let c: any;
    let css: any = {};
    return [
        Inspect(),
        // Pages({
        //     // importMode: "async",
        //     pagesDir: resolve('src/pages'),
        // }),
        htmlTemplate(config),

        {
            enforce: 'post',
            apply: 'serve',
            configResolved(resolvedConfig: any) {
                // store the resolved config
                c = resolvedConfig
            },
            transform (code: any, id: any, {ssr}: any) {

                if (c.command === 'serve') {
                    if (ssr && id.endsWith('.css')) {
                        
                        if (!css[id]) {
                            css[id] = code.trim().slice(16, -1).replace(/\\n/gi, "");

                            return `global.css = ${JSON.stringify(Object.values(css))}`;
                        }
                        // console.log('sssss')
                        // return `global.css = (global.css || []).push("${code.trim().slice(16, -1)}")`;
                    }
                  } else {
                    // build: plugin invoked by Rollup
                  }

                
            },
        }
    ]
  }

export type { UserOptions as HtmlTemplateOptions }