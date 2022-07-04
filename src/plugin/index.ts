import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite'
import path from 'path'

import Inspect from 'vite-plugin-inspect'
import Reactica from './reactica'


export default (config: any) => {
    return [
        Inspect(),
        Reactica(config),
    ]
}