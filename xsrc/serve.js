// @ts-check
const fs = require('fs')
const path = require('path')
const express = require('express')
const dom = require('react-router-dom');
const { matchPath } = dom;
var cookieParser = require('cookie-parser');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
const PORT = process.env.PORT || 3000

async function createServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === 'production'
) {
    const resolve = (p) => path.resolve(__dirname, p)

    const indexProd = isProd
        ? fs.readFileSync(resolve('../../dist/index.html'), 'utf-8')
        : ''

    const app = express()
    app.use(cookieParser())

    /**
     * @type {import('vite').ViteDevServer}
     */
    let vite
    if (!isProd) {
        vite = await require('vite').createServer({
            root,
            logLevel: isTest ? 'error' : 'info',
            server: {
                middlewareMode: 'ssr',
                watch: {
                    // During tests we edit the files too fast and sometimes chokidar
                    // misses change events, so enforce polling for consistency
                    usePolling: true,
                    interval: 100
                }
            }
        })
        // use vite's connect instance as middleware
        app.use(vite.middlewares)
    } else {
        app.use(require('compression')())
        app.use(
            require('serve-static')(resolve('.next2/client'), {
                index: false
            })
        )
    }

    app.use('*', async (req, res) => {
        try {
            const url = req.originalUrl;
            const urlNoLanguage = url.replace('/ar/', '/').replace('/en/', '/').replace('/ar', '/')

            if (url.includes("favicon.svg") || url.includes("favicon.ico")) {
                return res.send("");
            }

            // console.log(`[${req.method}] ${url}`)

            let routes;
            let serverFile;

            console.log(`[${req.method}] ${url}`)

            if (!isProd) {
                routes = (await vite.ssrLoadModule('./src/server.tsx')).routes;
            } else {
                serverFile = require('../../.next2/server/dist/server.js');
                routes = serverFile.routes;
            }

            const matchedRoute = routes.find(route => matchPath(urlNoLanguage, route.path))
            if (!matchedRoute) {
                return res.status(404).send('Not Found');;
            }

            let data = {
                "props":{},
                "page": matchedRoute.path,
                "query":{},
                // "buildId":"7E2tFlrzYeS1BKg21-QvO",
                "isFallback":false,
                "gip":true,
                "appGip":true,
                "scriptLoader":[]
            };
            if (matchedRoute.element.props.app.getInitialProps) {
                data['props'] = await matchedRoute.element.props.app.getInitialProps(matchedRoute.component)
                // data.index = routes.findIndex(route => matchPath(urlNoLanguage, route))
            } else if (matchedRoute.component) {
                data['props'] = await matchedRoute.component()
            }

            let cssUrls = new Set(), cssJsUrls = new Set()
            function collectCssUrls(mod) {
                mod.importedModules.forEach(submod => {
                    if (submod.id.match(/\?vue.*&lang\.css/)) return cssJsUrls.add(submod.url)
                    if (submod.file.endsWith(".css")) return cssUrls.add(submod.url)
                    if (submod.file.endsWith(".vue")) return collectCssUrls(submod)
                    /* TODO include js files like routes that include other components */
                    if (submod.file.match(/route/)) return collectCssUrls(submod)
                })
            }

            let template, render
            if (!isProd) {
                // always read fresh template in dev
                template = fs.readFileSync(resolve('../../index.html'), 'utf-8')
                template = await vite.transformIndexHtml(url, template)
                render = (await vite.ssrLoadModule('/src/server.tsx')).render

                // const mod = await vite.moduleGraph.getModuleByUrl('/src/client.tsx') /* TODO replace with your entry */
                //     console.log('mod', mod)
                // cssUrls = mod.ssrTransformResult.deps.filter(d => d.endsWith(".css"))
            } else {
                template = indexProd
                render = serverFile.render
            }

            const devCss = [...cssUrls].map(url => {
                return `<link rel="stylesheet" type="text/css" href="${url}">`
            }).join("") + [...cssJsUrls].map(url => {
                return `<script type="module" src="${url}"></script>`
            }).join("")

            console.log('devCss', devCss)

            const context = {
                url: null,
                state: data,
            }
            const css = {};//new ServerStyleSheet();
            const appHtml = await render(url, context)

            if (context.url) {
                // Somewhere a `<Redirect>` was rendered
                return res.redirect(301, context.url)
            }

            const html = template
                .replace(`<!--app-html-->`, appHtml)
                // .replace(`<!--app-auth-->`, `<script>window.__AUTH = ${JSON.stringify(auth)};</script>`)
                // .replace(`<!--app-store-->`, `<script>window.__INIT__STORE = ${JSON.stringify(store)};</script>`)
                .replace(`<!--app-state-->`, `<script>window.__INITIAL_DATA = ${JSON.stringify(data)};</script>`)

            res.status(200)// .set({ 'Content-Type': 'text/html' })
                .end(html)
        } catch (e) {
            !isProd && vite.ssrFixStacktrace(e)
            console.log(e.stack)
            res.status(500).end(e.stack)
        }
    })

    return { app, vite }
}

if (!isTest) {
    createServer().then(({ app }) =>
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`)
        })
    )
}

// for test use
exports.createServer = createServer