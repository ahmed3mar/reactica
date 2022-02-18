import React, {useParams} from 'react-router-dom'

export const useRouter = () => {
    const params = useParams();
    return {
        params,
    };
}

// export declare type RouterProps<TGenerics extends PartialGenerics> = TGenerics;
export declare type RouterProps<TGenerics> = TGenerics;