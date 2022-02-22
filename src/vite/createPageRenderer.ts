import { matchPath } from "./utils/matchPath";

const renderPage = async (viteDevServer: any, pageContextInit: any) => {

    const { render } = await viteDevServer.ssrLoadModule("pages/_document");
    const {server} = await viteDevServer.ssrLoadModule("virtual:reacticajs:server");
    const pages = (await viteDevServer.ssrLoadModule("~react-pages")).default;

    const pageContext = pageContextInit;

    // @ts-ignore
    const page = pages.find((page: any) => matchPath(pageContext.url, '/' + (page.path || '')));

    if (!page) {

        pageContext.httpResponse = {
            body: '404 page !!',
            statusCode: 404,
            contentType: 'text/html',
        }

        return pageContext
    }

    const data = await render({
        Main: await server(pageContextInit),
        pageProps: {

        }
    });

    let html = await viteDevServer.transformIndexHtml('/', data.documentHtml)

    html = html.replace('</body>', '</body>' + `
        <script type="module" src="/reactica:start.js"></script>
    `)

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