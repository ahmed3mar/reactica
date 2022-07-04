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

const LocalizedComponent = ({ NotFound, appStrings, languages = [], defaultLanguage = "en", defaultCurrency = "USD" }: any) => {

    return (
        <div>
            HI
        </div>
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