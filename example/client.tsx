const app = document.querySelector('#app') as Element

import { hydrate, render } from 'react-dom'

// @ts-ignore
// const PRESERVED = import.meta.globe('/src/pages/(_app|404).tsx')
// console.log('import.meta.globEager', PRESERVED)

// const main = import.meta.globEager('/src/pages/(_app|404).tsx')
const pages = import.meta.globEager('/src/pages/**/*.tsx')

import { Client } from 'reactica'

// @ts-ignore
const data = window?.__INITIAL_DATA;

const application = <Client context={{ state: data }} pages={pages} />;

if (app.hasChildNodes()) hydrate(application, app)
else render(application, app)