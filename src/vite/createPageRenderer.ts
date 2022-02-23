import { matchPath } from "./utils/matchPath";

// import { matchPath } from 'react-router-dom';

const renderPage = async (viteDevServer: any, pageContextInit: any) => {

    const { render } = await viteDevServer.ssrLoadModule("pages/_document");
    const {server} = await viteDevServer.ssrLoadModule("virtual:reacticajs:server");


    console.log('adfadsfsdfsdsdf')

    const loadPages = (await viteDevServer.ssrLoadModule("virtaul:reacticajs:pages-sync")).default;

    console.log('loadPages', loadPages)

    const {routes: pages} = loadPages(pageContextInit);

    const pageContext = pageContextInit;

    // @ts-ignore
    const page = pages.find((page: any) => matchPath(pageContext.url, (page.path ? page.path : '/')));

    // if (page) {
    //     let getInitialProps = Promise.resolve(null);
    //     const app = page.element?.props?.app;
    //     console.log('paaaage', page);
    //     const component = page.element?.props?.component;
    //     if (app?.getInitialProps) {
    //         getInitialProps = app.getInitialProps(component)
    //         // getInitialProps = route.component.getInitialProps(route.component, { match, req, res })
    //     }

    //     console.log('getInitialProps', getInitialProps)
    // }

    let contextData = {
        "props":{},
        "page": page?.path || '404',
        "query":{},
        // "buildId":"7E2tFlrzYeS1BKg21-QvO",
        "isFallback":false,
        "gip":true,
        "appGip":true,
        "scriptLoader":[]
    };


    if (page) {


        const getInitialPropsComponentProps = {
            err: undefined,
            req: '',
            res: '',
    
            pathname: '/',
            query: {},
            asPath: '/',
            locale: undefined,
            locales: undefined,
            defaultLocale: undefined,
            // AppTree: [Function: AppTree],
            // defaultGetInitialProps: [AsyncFunction: defaultGetInitialProps]
        }
    
        const getInitialPropsAppProps = {
            // AppTree: [Function: AppTree],
            Component: page.component,
            // Component: [Function: Home] { getInitialProps: [AsyncFunction (anonymous)] },
            router:  {
                route: '/',
                pathname: '/',
                query: {},
                asPath: '/',
                isFallback: false,
                basePath: '',
                locale: undefined,
                locales: undefined,
                defaultLocale: undefined,
                isReady: true,
                domainLocales: undefined,
                isPreview: false,
                isLocaleDomain: false
            },
            cts: getInitialPropsComponentProps
        }


        if (page.element.props.app.getInitialProps) {
            const res = await page.element.props.app.getInitialProps(getInitialPropsAppProps)
            if (res && typeof res === "object" && !Array.isArray(res)) {
                const { pageProps = {}, ...rest } = res;
                contextData['props'] = pageProps;
                // @ts-ignore
                contextData['mainProps'] = rest;
            } else {
                console.error('returned an empty object from `getInitialProps`. This de-optimizes and prevents automatic static optimization. https://nextjs.org/docs/messages/empty-object-getInitialProp');
            }
            
            // data.index = routes.findIndex(route => matchPath(urlNoLanguage, route))
        } else if (page?.component?.getInitialProps) {
            contextData['props'] = await page.component.getInitialProps(getInitialPropsComponentProps)
        }
    }

    pageContextInit['state'] = contextData;

    const data = await render({
        Main: await server(pageContextInit),
        pageProps: contextData['props'],
    });

    let html = await viteDevServer.transformIndexHtml('/', data.documentHtml)

    html = html.replace('</body>', '</body>' + `
        <script type="module" src="/reactica:start.js"></script>
    `)

    let css = '';
    // @ts-ignore
    if (global?.css) {
        // @ts-ignore
        const cssFiles = global?.css;
        css = cssFiles.map((f: any) => {
            return `
                <style type="text/css">
                    ${f}
                </style>
            `
        }).join('')
    
    }

    html = html.replace(`<!--app-state-->`, `<script>window.__INITIAL_DATA = ${JSON.stringify(contextData)};</script>${css}`)


    let cssUrls = new Set(), cssJsUrls = new Set()
    function collectCssUrls(mod: any) {
        mod.importedModules.forEach((submod: any) => {
            if (submod.id.match(/\?vue.*&lang\.css/)) return cssJsUrls.add(submod.url)
            if (submod.file.endsWith(".css")) return cssUrls.add(submod.url)
            if (submod.file.endsWith(".vue")) return collectCssUrls(submod)
            /* TODO include js files like routes that include other components */
            if (submod.file.match(/route/)) return collectCssUrls(submod)
        })
    }

    if (!page) {
        pageContext.httpResponse = {
            body: html,
            statusCode: 404,
            contentType: 'text/html',
        }

        return pageContext
    }

    // if (!page) {
    //     pageContext.httpResponse = {
    //         body: '404 page !!',
    //         statusCode: 404,
    //         contentType: 'text/html',
    //     }

    //     return pageContext
    // }

    

    pageContext.httpResponse = {
        body: html,
        statusCode: 200,
        contentType: 'text/html',
    }

    return pageContext
}

export const createPageRenderer = ({ viteDevServer }: any) => {
    return async (context: any) => await renderPage(viteDevServer, context)
}