// export { escapeInject, dangerouslySkipEscape } from './vite/html/renderHtml'
// export { pipeWebStream, pipeNodeStream } from './vite/html/stream'
// export { injectAssets__public as _injectAssets } from './vite/html/injectAssets'
// export { RenderErrorPage } from './vite/renderPage/RenderErrorPage'
import React from 'react';

export { Link } from 'react-router-dom'

import {
  useState,
  useEffect,
  createElement,
  Fragment,
  FunctionComponent,
  ReactElement,
  createContext as reactCreateContext,
  useContext as reactUseContext,
} from 'react'

export const ClientOnly: FunctionComponent = ({ children }: any) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true))

  return mounted ? createElement(Fragment, { children }) : null
}

export const clientOnly = (component: any) => {
  // @ts-ignore
  return (props: any) => <ClientOnly>{createElement(component, props)}</ClientOnly>
}