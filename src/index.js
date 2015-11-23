
import {
    markEmail,
    markNonDigits,
    markNonEmail,
    markNonEnNumeric,
    markNonEuNumeric,
    markNonInt,
    markNonNumeric,
    markNonUint,
    markNonUrl,
    markUrls
} from './markers';

export const markers = {
    email: markEmail,
    nonDigits: markNonDigits,
    nonEmail: markNonEmail,
    nonEnNumeric: markNonEnNumeric,
    nonEuNumeric: markNonEuNumeric,
    nonInt: markNonInt,
    nonNumeric: markNonNumeric,
    nonUint: markNonUint,
    nonUrl: markNonUrl,
    urls: markUrls
};

export { getInverseMarker, getMatchMarker } from './markers';

import TxRegionsInput from './TxRegionsInput';
export default TxRegionsInput;

export { classNames } from './TxRegionsInput';

export { validatorDefaults } from './validators';
