import React, { useContext, Component } from "react"

import { HtmlContext } from './html-context'
import type { HtmlProps } from './html-context'

export type RenderPage = (
    // options?: ComponentsEnhancer
) => DocumentInitialProps | Promise<DocumentInitialProps>

export type DocumentContext = {
    renderPage: RenderPage
    defaultGetInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps>
}

export type RenderPageResult = {
    html: string
    head?: Array<JSX.Element | null>
}

export type DocumentInitialProps = RenderPageResult & {
    styles?: React.ReactElement[] | React.ReactFragment
}

export type DocumentProps = DocumentInitialProps & HtmlProps


export type OriginProps = {
    nonce?: string
    crossOrigin?: string
}

/**
 * `Document` component handles the initial `document` markup and renders only on the server side.
 * Commonly used for implementing server side rendering for `css-in-js` libraries.
 */
export default class Document<P = {}> extends Component<DocumentProps & P> {
    /**
     * `getInitialProps` hook returns the context object with the addition of `renderPage`.
     * `renderPage` callback executes `React` rendering logic synchronously to support server-rendering wrappers
     */
    static getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        return ctx.defaultGetInitialProps(ctx)
    }

    render() {
        return (
            <Html>
                <Head />
                <body>
                    <Main />
                    {/* <NextScript /> */}
                </body>
            </Html>
        )
    }
}

export const Html = (props: React.DetailedHTMLProps<
    React.HtmlHTMLAttributes<HTMLHtmlElement>,
    HTMLHtmlElement
>) => {

    const { inAmpMode, docComponentsRendered, locale } = useContext(HtmlContext)

    return (
        <html
            {...props}
            lang={props.lang || locale || undefined}
            // @ts-ignore
            amp={inAmpMode ? '' : undefined}
            data-ampdevmode={
                inAmpMode && process.env.NODE_ENV !== 'production' ? '' : undefined
            }
        />
    )
}

export class Head extends Component<
    OriginProps &
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLHeadElement>,
        HTMLHeadElement
    >
> {
    static contextType = HtmlContext

    // context!: React.ContextType<typeof HtmlContext>
    // context!: HtmlContext

    render() {

        const {
            styles,
            ampPath,
            inAmpMode,
            hybridAmp,
            canonicalBase,
            // __NEXT_DATA__,
            dangerousAsPath,
            headTags,
            unstable_runtimeJS,
            unstable_JsPreload,
            disableOptimizedLoading,
            optimizeCss,
            optimizeFonts,
            runtime,
        } = this.context

        const hasConcurrentFeatures = !!runtime

        const disableRuntimeJS = unstable_runtimeJS === false
        const disableJsPreload =
            unstable_JsPreload === false || !disableOptimizedLoading

        // this.context.docComponentsRendered.Head = true

        let { head } = this.context

        let cssPreloads: Array<JSX.Element> = []
        let otherHeadElements: Array<JSX.Element> = []
        if (head) {
            head.forEach((c: any) => {
                if (
                    c &&
                    c.type === 'link' &&
                    c.props['rel'] === 'preload' &&
                    c.props['as'] === 'style'
                ) {
                    cssPreloads.push(c)
                } else {
                    c && otherHeadElements.push(c)
                }
            })
            head = cssPreloads.concat(otherHeadElements)
        }
        let children = React.Children.toArray(this.props.children).filter(Boolean)

        // show a warning if Head contains <title> (only in development)
        if (process.env.NODE_ENV !== 'production') {
            children = React.Children.map(children, (child: any) => {
                const isReactHelmet = child?.props?.['data-react-helmet']
                if (!isReactHelmet) {
                    if (child?.type === 'title') {
                        // console.warn(
                        //     "Warning: <title> should not be used in _document.js's <Head>. https://nextjs.org/docs/messages/no-document-title"
                        // )
                    } else if (
                        child?.type === 'meta' &&
                        child?.props?.name === 'viewport'
                    ) {
                        console.warn(
                            "Warning: viewport meta tags should not be used in _document.js's <Head>. https://nextjs.org/docs/messages/no-document-viewport-meta"
                        )
                    }
                }
                return child
            })
            if (this.props.crossOrigin)
                console.warn(
                    'Warning: `Head` attribute `crossOrigin` is deprecated. https://nextjs.org/docs/messages/doc-crossorigin-deprecated'
                )
        }

        // if (process.env.NODE_ENV !== 'development' && optimizeFonts && !inAmpMode) {
        //     children = this.makeStylesheetInert(children)
        // }

        // children = this.handleDocumentScriptLoaderItems(children)

        let hasAmphtmlRel = false
        let hasCanonicalRel = false

        // show warning and remove conflicting amp head tags
        // @ts-ignore
        head = React.Children.map(head || [], (child) => {
            if (!child) return child
            const { type, props } = child
            if (inAmpMode) {
                let badProp: string = ''

                if (type === 'meta' && props.name === 'viewport') {
                    badProp = 'name="viewport"'
                } else if (type === 'link' && props.rel === 'canonical') {
                    hasCanonicalRel = true
                } else if (type === 'script') {
                    // only block if
                    // 1. it has a src and isn't pointing to ampproject's CDN
                    // 2. it is using dangerouslySetInnerHTML without a type or
                    // a type of text/javascript
                    if (
                        (props.src && props.src.indexOf('ampproject') < -1) ||
                        (props.dangerouslySetInnerHTML &&
                            (!props.type || props.type === 'text/javascript'))
                    ) {
                        badProp = '<script'
                        Object.keys(props).forEach((prop) => {
                            badProp += ` ${prop}="${props[prop]}"`
                        })
                        badProp += '/>'
                    }
                }

                if (badProp) {
                    console.warn(
                        `ERROR `
                        // `Found conflicting amp tag "${child.type}" with conflicting prop ${badProp} in ${__NEXT_DATA__.page}. https://nextjs.org/docs/messages/conflicting-amp-tag`
                    )
                    return null
                }
            } else {
                // non-amp mode
                if (type === 'link' && props.rel === 'amphtml') {
                    hasAmphtmlRel = true
                }
            }
            return child
        })

        // const files: DocumentFiles = getDocumentFiles(
        //     this.context.buildManifest,
        //     this.context.__NEXT_DATA__.page,
        //     inAmpMode
        // )


        return (
            <head {...this.props}>
                {!hasConcurrentFeatures && this.context.isDevelopment && (
                    <>
                        <style
                            data-next-hide-fouc
                            data-ampdevmode={inAmpMode ? 'true' : undefined}
                            dangerouslySetInnerHTML={{
                                __html: `body{display:none}`,
                            }}
                        />
                        <noscript
                            data-next-hide-fouc
                            data-ampdevmode={inAmpMode ? 'true' : undefined}
                        >
                            <style
                                dangerouslySetInnerHTML={{
                                    __html: `body{display:block}`,
                                }}
                            />
                        </noscript>
                    </>
                )}
                
                <meta name="reactica-head" />

                {head}
                <meta
                    name="next-head-count"
                    content={React.Children.count(head || []).toString()}
                />

                {children}
                {optimizeFonts && <meta name="next-font-preconnect" />}

                {inAmpMode && (
                    <>
                        <meta
                            name="viewport"
                            content="width=device-width,minimum-scale=1,initial-scale=1"
                        />
                        {/* {!hasCanonicalRel && (
                            <link
                                rel="canonical"
                                href={canonicalBase + cleanAmpPath(dangerousAsPath)}
                            />
                        )} */}
                        {/* https://www.ampproject.org/docs/fundamentals/optimize_amp#optimize-the-amp-runtime-loading */}
                        <link
                            rel="preload"
                            as="script"
                            href="https://cdn.ampproject.org/v0.js"
                        />
                        {/* <AmpStyles styles={styles} /> */}
                        <style
                            amp-boilerplate=""
                            dangerouslySetInnerHTML={{
                                __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`,
                            }}
                        />
                        <noscript>
                            <style
                                amp-boilerplate=""
                                dangerouslySetInnerHTML={{
                                    __html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`,
                                }}
                            />
                        </noscript>
                        <script async src="https://cdn.ampproject.org/v0.js" />
                    </>
                )}
                {!inAmpMode && (
                    <>
                        {/* {!hasAmphtmlRel && hybridAmp && (
                            <link
                                rel="amphtml"
                                href={canonicalBase + getAmpPath(ampPath, dangerousAsPath)}
                            />
                        )} */}
                        {/* {!optimizeCss && this.getCssLinks(files)}
                        {!optimizeCss && <noscript data-n-css={this.props.nonce ?? ''} />}

                        {!disableRuntimeJS &&
                            !disableJsPreload &&
                            this.getPreloadDynamicChunks()}
                        {!disableRuntimeJS &&
                            !disableJsPreload &&
                            this.getPreloadMainLinks(files)}

                        {!disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getPolyfillScripts()}

                        {!disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getPreNextScripts()}
                        {!disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getDynamicChunks(files)}
                        {!disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getScripts(files)}

                        {optimizeCss && this.getCssLinks(files)} */}
                        {optimizeCss && <noscript data-n-css={this.props.nonce ?? ''} />}
                        {this.context.isDevelopment && (
                            // this element is used to mount development styles so the
                            // ordering matches production
                            // (by default, style-loader injects at the bottom of <head />)
                            <noscript id="__next_css__DO_NOT_USE__" />
                        )}
                        {styles || null}
                    </>
                )}
                {React.createElement(React.Fragment, {}, ...(headTags || []))}
            </head>
        )
    }
}

export function Main() {
    const { docComponentsRendered } = useContext(HtmlContext)
    docComponentsRendered.Main = true
    // @ts-ignore
    return <div id="reactica-app"></div>
}

function getAmpPath(ampPath: string, asPath: string): string {
    return ampPath || `${asPath}${asPath.includes('?') ? '&' : '?'}amp=1`
}