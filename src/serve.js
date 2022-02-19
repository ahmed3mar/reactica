// @ts-check
const fs = require('fs')
const path = require('path')
const express = require('express')

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
        ? fs.readFileSync(resolve('../../dist/index.html'), 'utf-8')
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
        app.use(require('compression')())
        app.use(
            require('serve-static')(resolve('dist/client'), {
                index: false
            })
        )
    }

    app.use('*', async (req, res) => {
        try {
            const url = req.originalUrl;

            console.log(`[${req.method}] ${url}`)
            const { routes } = await vite.ssrLoadModule('src/server.tsx')

            const matches = routes.reduce((founded, route) => {
                const match = matchPath(url, route.path, route);
                // We then look for static getInitialData function on each top level component
                if (match) {
                    let getInitialProps = Promise.resolve(null);
                    console.log('route.element?.props?.app', route.component.getInitialProps)
                    if (route.element?.props?.app?.getInitialProps) {
                        getInitialProps = route.element?.props?.app?.getInitialProps(route.component, { match, req, res })
                        // getInitialProps = route.component.getInitialProps(route.component, { match, req, res })
                    }

                    const obj = {
                        route,
                        match,
                        promise: getInitialProps,
                    };
                    return obj;
                }
                return founded;
            }, null);

            if (!matches) {
                res.status(404).send('Not Found');
            }

            // Now we pull out all the promises we found into an array.
            const promises = [matches?.promise];//matches.map(match => (match ? match.promise : null));
            const data = {
                [matches?.route?.path]: (await Promise.all(promises))[0]
            }

            let template, render
            if (!isProd) {
                // always read fresh template in dev
                template = fs.readFileSync('./index.html', 'utf-8')
                template = await vite.transformIndexHtml(url, template)
                render = (await vite.ssrLoadModule('/src/server.tsx')).render
            } else {
                template = indexProd
                render = require('../../build/server/dist/server.js').render
            }

            const context = {}
            const css = {};//new ServerStyleSheet();

            context.state = data;
            // context.store = store;
            context.currentUrl = url;

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
                // .replace(`<!--css-->`, css.getStyleTags())

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
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
        app.listen(3000, () => {
            console.log('http://localhost:3000')
        })
    )
}

// for test use
exports.createServer = createServer