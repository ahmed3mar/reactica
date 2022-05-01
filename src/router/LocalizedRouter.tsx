import React, {useEffect} from 'react';
import { IntlProvider } from 'react-intl';
import {Routes, Route, Outlet, useParams, useNavigate} from 'react-router-dom';
import {useRouter} from "./index";
// import { AppLanguage } from 'const';

// import { LanguageStrings } from '../localizations';

interface Props {
    children: any;
    RouterComponent: React.ComponentClass<any>;
    languages: { [k: number]: string };
    appStrings: { [prop: string]: any };
    defaultLanguage?: string;
}

// export const LocalizedRouter: React.FC<Props> = ({
//      children,
//      RouterComponent,
//      appStrings,
//      defaultLanguage,
// }) => (
//     <RouterComponent>
//         <Route path="/:lang([a-zA-Z]{2})">
//             {
//                 // @ts-ignore
//                 ({ match, location }) => {
//                 /**
//                  * Get current language
//                  * Set default locale to en if base path is used without a language
//                  */
//                 const params = match ? match.params : {};
//                 const { lang = defaultLanguage || "en" } = params;
//
//                 /**
//                  * If language is not in route path, redirect to language root
//                  */
//                 const { pathname } = location;
//                 if (!pathname.includes(`/${lang}/`)) {
//                     return (
//                         <div>
//                             REDIREDCT !
//                         </div>
//                     )
//                     // return <Redirect to={`/${lang}/`} />;
//                 }
//
//                 /**
//                  * Return Intl provider with default language set
//                  */
//                 return (
//                     <IntlProvider locale={lang} messages={appStrings[lang]}>
//                         {children}
//                     </IntlProvider>
//                 );
//             }}
//         </Route>
//     </RouterComponent>
// );

const LocalizedComponent = ({ NotFound, appStrings, languages = [], defaultLanguage = "en", defaultCurrency = "USD" }: any) => {

    const {
        url_locale,
    } = useParams();

    const navigate = useNavigate();

    const { pathname } = useRouter();

    let lang = defaultLanguage;
    let fallbackLang = defaultLanguage;
    if (url_locale) {
        fallbackLang = url_locale.split('-')
        lang = url_locale
    }

    useEffect(() => {
        if (!url_locale) {
            navigate(`/${defaultLanguage}${pathname}`, {
                replace: true,
            })
        }
    })

    if (!url_locale) {
        return (
            <div>!!!</div>
        );
    }

    if (url_locale?.length !== 2 && url_locale?.length !== 5) {
        return (
            <NotFound />
        )
    }

    if (!languages.includes(url_locale)) {
        return (
            <NotFound />
        )
    }

    // if (!pathname.includes(`/${lang}`)) {
    //     return (
    //         <div>{pathname}</div>
    //     )
    // }

    return (
        // @ts-ignore
        <IntlProvider locale={lang} messages={appStrings[lang] || appStrings[fallbackLang]}>
            <Outlet />
        </IntlProvider>
    )
}


export const LocalizedRouter = ({ routes, ...other }: any) => {
    return (
        <Routes>
            <Route path="/:url_locale" element={<LocalizedComponent {...{routes, ...other}} />}>
                {routes}
            </Route>
            <Route path="*" element={<LocalizedComponent {...{routes, ...other}} />}>
                {routes}
            </Route>
        </Routes>
    )
}
