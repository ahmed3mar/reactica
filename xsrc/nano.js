// @ts-check
const fs = require('fs')
const path = require('path')
const express = require('nanoexpress')
const staticServe = require('@nanoexpress/middleware-static-serve/cjs');

const dom = require('react-router-dom');
const { matchPath } = dom;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

async function createServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === 'production'
) {
    const resolve = (p) => path.resolve(__dirname, p)

    const indexProd = isProd
        ? fs.readFileSync(resolve('../../.next2/index.html'), 'utf-8')
        : ''

    const app = express()

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
        // app.use(require('compression')())
        // app.use(
        //     require('serve-static')(resolve('dist/client'), {
        //         index: false
        //     })
        // )
        app.use(staticServe(resolve('../../.next2/assets'), {
            index: false,
            // mode: "live"
        }));
    }

    app.setNotFoundHandler(async (req, res) => {
        try {
            const url = req.url
            const urlNoLanguage = url.replace('/ar/', '/').replace('/en/', '/').replace('/ar', '/')

            // console.log(`[${req.method}] ${url}`)

            let routes;
            let serverFile;

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

            let template, render
            if (!isProd) {
                // always read fresh template in dev
                template = fs.readFileSync(resolve('../../index.html'), 'utf-8')
                template = await vite.transformIndexHtml(url, template)
                render = (await vite.ssrLoadModule('/src/server.tsx')).render
            } else {
                template = indexProd
                render = serverFile.render
            }

            const context = {
                url: null,
                state: data,
            }
            const css = {};//new ServerStyleSheet();
            const appHtml = await render(url, context, css, data)

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

    app.any('/assets/:assets', async (req, res) => {
        res.end("fff")
    })

    return { app, vite }
}

if (!isTest) {
    createServer().then(({ app }) => {
        app.listen(3000)
        console.log('http://localhost:3000')
    })
}

// for test use
exports.createServer = createServer