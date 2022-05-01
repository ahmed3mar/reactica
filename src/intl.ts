import * as intl from "react-intl";

export const trans = (word: string, options: any = {}) => {
    const { formatMessage } = intl.useIntl();
    try {
        return formatMessage({ id: word, ...options });
    } catch (err) {
        return word;
    }
}

export const useIntl: any = () => {

    const { locale, ...other } = intl.useIntl();

    let language = locale;
    if (/([a-zA-Z]){2}-([a-zA-Z]){2}/.test(locale)) {
        language = locale.split("-")[0];
    }


    return {
        locale,
        ...other,
        trans,
        language,
    }
}
