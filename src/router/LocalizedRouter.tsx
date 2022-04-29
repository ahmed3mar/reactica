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

const LocalizedComponent = ({ NotFound, routes, languages, countries, defaultLanguage = "en", defaultCurrency = "USD" }: any) => {

    const {
        lang,
        nationality,
    } = useParams();

    const navigate = useNavigate();

    const { pathname } = useRouter();

    useEffect(() => {
        if (!lang && !nationality) {
            navigate(`/${defaultLanguage}-EG${pathname}`, {
                replace: true,
            })
        }
    })

    if (!lang && !nationality) {
        return (
            <div>!!!</div>
        );
    }

    if (lang?.length !== 2 || nationality?.length !== 2) {
        return (
            <NotFound />
        )
    }

    // if (!pathname.includes(`/${lang}`)) {
    //     return (
    //         <div>{pathname}</div>
    //     )
    // }


    const appStrings = {
        en: {
            home: "Home",
            world: "World",
        },
        ar: {
            home: "البيت يا سيدي",
            world: "Monde",
        },
    };

    return (
        // @ts-ignore
        <IntlProvider locale={lang} messages={appStrings[lang]}>
            <Outlet />
        </IntlProvider>
    )
}


export const LocalizedRouter = ({ NotFound, routes, languages, countries, defaultLanguage, defaultCurrency }: any) => {
    return (
        <Routes>
            <Route path="/:lang-:nationality" element={<LocalizedComponent {...{NotFound, routes, languages, countries, defaultLanguage, defaultCurrency}} />}>
                {routes}
            </Route>
            <Route path="*" element={<LocalizedComponent {...{NotFound, routes, languages, countries, defaultLanguage, defaultCurrency}} />}>
                {routes}
            </Route>
        </Routes>
    )
}
