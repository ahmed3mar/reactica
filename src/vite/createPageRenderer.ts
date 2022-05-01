import { matchPath } from "./utils/matchPath";
import path, { basename } from 'path'

// import { matchPath } from 'react-router-dom';

function renderPreloadLinks(modules: any, manifest: any) {
    let links = ''
    const seen = new Set()
    modules.forEach((id: any) => {
      const files = manifest[id]
      if (files) {
        files.forEach((file: any) => {
          if (!seen.has(file)) {
            seen.add(file)
            const filename = basename(file)
            if (manifest[filename]) {
              for (const depFile of manifest[filename]) {
                links += renderPreloadLink(depFile)
                seen.add(depFile)
              }
            }
            links += renderPreloadLink(file)
          }
        })
      }
    })
    return links
  }

function renderPreloadClientLinks(modules: any, manifest: any) {
    let links = ''
    const seen = new Set()
    modules.forEach((id: any) => {
      const item = manifest[id]
      if (item) {

          const file = item.file;
          const css = item.css;

          links += renderPreloadLink("/" + file)
          if (css) {
            for (const cssFile of css) {
              links += renderPreloadLink("/" + cssFile)
            }
          }


        // files.forEach((file: any) => {
        //   if (!seen.has(file)) {
        //     seen.add(file)
        //     const filename = basename(file)
        //     if (manifest[filename]) {
        //       for (const depFile of manifest[filename]) {
        //         links += renderPreloadLink(depFile)
        //         seen.add(depFile)
        //       }
        //     }
        //     links += renderPreloadLink(file)
        //   }
        // })
      }
    })
    return links
  }

  function renderPreloadLink(file: any) {
    if (file.endsWith('.js')) {
      return `<script type="module" crossorigin src="${file}"></script>`
    } else if (file.endsWith('.css')) {
      return `<link rel="stylesheet" href="${file}">`
    } else if (file.endsWith('.woff')) {
      return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
    } else if (file.endsWith('.woff2')) {
      return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
    } else if (file.endsWith('.gif')) {
      return ` <link rel="preload" href="${file}" as="image" type="image/gif">`
    } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`
    } else if (file.endsWith('.png')) {
      return ` <link rel="preload" href="${file}" as="image" type="image/png">`
    } else {
      // TODO
      return ''
    }
  }

const renderPage = async (viteDevServer: any, isProduction: boolean, root: string, pageContextInit: any) => {

    let loadPages;
    let renderString;
    let preloadLinks;
    if (isProduction) {
        const { renderString: RS, loadPages: LP, ...o } = require(root + '/dist/server/server.js');

        // const manifest = require(root + '/dist/ssr-manifest.json');
        const clientManifest = require(root + '/dist/manifest.json');
        // const preloadLinks = renderPreloadLinks(["index.html"], clientManifest)
        preloadLinks = renderPreloadClientLinks(["index.html"], clientManifest)

        loadPages = LP
        renderString = RS
    } else {
        // const { render } = await viteDevServer.ssrLoadModule("pages/_document");
        let {renderString: renderStringF} = await viteDevServer.ssrLoadModule("virtual:reacticajs:server");
        renderString = renderStringF;

        loadPages = (await viteDevServer.ssrLoadModule("virtual:reacticajs:pages-sync")).default;
    }

    const {routes: pages} = loadPages(pageContextInit);

    const pageContext = pageContextInit;

    const url = pageContext.url.replace(/^\/([a-zA-Z]){2}-([a-zA-Z]){2}/, '');

    console.info('url', url);

    // @ts-ignore
    const page = pages.find((page: any) => matchPath(url, (page.path ? page.path : '/')));

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

    const cookies = pageContextInit.req.cookies;
    pageContextInit['cookies'] = cookies;
    if (!pageContextInit['variables']) pageContextInit['variables'] = {};


    if (page) {
        const getInitialPropsComponentProps = {
            err: undefined,
            req: '',
            res: '',

            pathname: url,
            query: pageContext?.query,
            asPath: url,
            locale: undefined,
            locales: undefined,
            defaultLocale: undefined,
            vairables: {},
            // AppTree: [Function: AppTree],
            // defaultGetInitialProps: [AsyncFunction: defaultGetInitialProps]
        }

        const getInitialPropsAppProps = {
            // AppTree: [Function: AppTree],
            Component: page.component,
            // Component: [Function: Home] { getInitialProps: [AsyncFunction (anonymous)] },
            router:  {
                route: '/',
                pathname: url,
                query: pageContext?.query,
                asPath: url,
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
            cts: getInitialPropsComponentProps,
            vairables: {},
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

        //pageContextInit['variables'] = getInitialPropsAppProps['vairables'];
    }

    pageContextInit['state'] = contextData;

    // console.log('renderStringrenderStringrenderString',
    //     await renderString(pageContextInit)
    // )

    // const data = await render({
    //     Main: await server(pageContextInit),
    //     pageProps: contextData['props'],
    // });

    let html = isProduction ? await renderString(pageContextInit) : await viteDevServer.transformIndexHtml('/', await renderString(pageContextInit))

    if (pageContextInit?.redirect) {
        pageContext.httpResponse = {
            statusCode: 301,
            headers: {
                location: pageContextInit.redirect
            }
        }

        return pageContext
    }

    html = isProduction ? html : html.replace('</body>', '</body>' + `
        <script type="module" src="/reactica:start.js"></script>
    `)

    if (isProduction) {
        html = html.replace('</head>', preloadLinks + '</heade>')
    }

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

    let variables = '';

    if (Object.keys(pageContextInit['variables']).length > 0) {
        variables = `<script type="text/javascript">window.__REACTICA_VARS=${JSON.stringify(pageContextInit['variables'])};<\/script>`;
    }

    html = html.replace(`<meta name="reactica-head"/>`, `<script>window.__INITIAL_DATA = ${JSON.stringify(contextData)};</script>${variables}${css}`)


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

export const createPageRenderer = ({ viteDevServer, isProduction, root }: any) => {
    return async (context: any) => await renderPage(viteDevServer, isProduction, root, context)
}
