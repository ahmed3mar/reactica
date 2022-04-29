import * as intl from "react-intl";

export const trans = (word: string) => {
    const { formatMessage } = intl.useIntl();
    return formatMessage({ id: word });
}

export const useIntl: any = () => {
    return {
        ...intl.useIntl(),
        trans,
    }
}
