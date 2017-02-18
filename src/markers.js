import twttrTxt from './vendor/twitter-text';

import { line } from './strings';
import * as regex from './regex';


const
    warnFn = (console.error || console.warn || console.log || function(){}).bind(console),
    CLASS_NAME_WARNING = line(`
        Configured to mark text ranges, but a CSS class name to mark
        them with is not found -- skipping`),
    CLASS_NAME_ERROR_MSG = line(`
        Argument error: configuration for a className is not provided
        -- use either a className as the second argument or provide an
        options object: {classNameFromProps, classNameFromClassNames}`);


function getRegExp(value, options, defaultFlags) {
    var flags;
    if (value instanceof RegExp) {
        return value;
    } else {
        // options.flags can be used to set flags on the RegExp
        flags = options && options.flags;
        return new RegExp('' + value, flags || defaultFlags);
    }
}


function getClassNameFromOptions(options) {
    var fromProps,
        fromClassNames,
        fallback;
    if (typeof options === 'string') {
        return {
            className: options
        };
    }
    fromProps = options.classNameFromProps;
    fromClassNames = options.classNameFromClassNames;
    fallback = options.fallbackClassName;
    if (!fromProps && !fromClassNames && !fallback) {
        return;
    }
    return {
        getClassName: function getClassName(component, classNames) {
            return fromProps && component.props[fromProps] || classNames[fromClassNames] || fallback;
        }
    };
}


export function getMatchMarker(value, options) {
    var rx,
        processOptsRv,
        classNameAlways,
        getClassName;
    if (!value) {
        return function(){};
    }
    // always use a RegExp
    rx = getRegExp(value, options);
    if (!rx.global) {
        warnFn('If the global flag is not set, only the first match will be found');
    }
    if (!options) {
        throw new Error(CLASS_NAME_ERROR_MSG);
    }
    processOptsRv = getClassNameFromOptions(options);
    if (processOptsRv.className) {
        classNameAlways = processOptsRv.className;
    } else if (processOptsRv.getClassName) {
        getClassName = processOptsRv.getClassName;
    } else {
        throw new Error(CLASS_NAME_ERROR_MSG);
    }
    return function markMatches(text, markRange, component, classNames) {
        const className = classNameAlways || getClassName(component, classNames);
        if (!className) {
            warnFn(CLASS_NAME_WARNING);
            return;
        }
        let m = rx.exec(text);
        if (!m) {
            return;
        }
        do {
            markRange(m.index, rx.lastIndex, className);
        } while (rx.global && (m = rx.exec(text)))
    }
}


export function getInverseMarker(value, options) {
    var rx,
        processOptsRv,
        classNameAlways,
        getClassName;
    if (!value) {
        return function(){};
    }
    // always use a RegExp
    rx = getRegExp(value, options);
    if (!options) {
        throw new Error(CLASS_NAME_ERROR_MSG);
    }
    processOptsRv = getClassNameFromOptions(options);
    if (processOptsRv.className) {
        classNameAlways = processOptsRv.className;
    } else if (processOptsRv.getClassName) {
        getClassName = processOptsRv.getClassName;
    } else {
        throw new Error(CLASS_NAME_ERROR_MSG);
    }
    return function markInverseMatches(text, markRange, component, classNames) {
        const className = classNameAlways || getClassName(component, classNames);
        if (!className) {
            warnFn(CLASS_NAME_WARNING);
            return;
        }
        let ci = 0,
            m = rx.exec(text);
        if (!m) {
            markRange(0, text.length, className);
            return;
        }
        do {
            if (m.index !== ci) {
                markRange(ci, m.index, className);
            }
            ci = m.index + m[0].length;
        } while (rx.global && (m = rx.exec(text)))
        if (ci < text.length) {
            markRange(ci, text.length, className);
        }
    }
}


export const markEmail = getMatchMarker(regex.EMAIL_GLOBAL, {
    classNameFromProps: 'classEmail',
    classNameFromClassNames: 'email'
});

export const markNonDigits = getMatchMarker(/\D+/g, {
    classNameFromProps: 'classNonDigits',
    classNameFromClassNames: 'nonDigits'
});

export const markNonEmail = getInverseMarker(regex.EMAIL, {
    classNameFromProps: 'classNonEmail',
    classNameFromClassNames: 'nonEmail'
});

export const markNonInt = getInverseMarker(regex.INT, {
    classNameFromProps: 'classNonInt',
    classNameFromClassNames: 'nonInt'
});

export const markNonEnNumeric = getInverseMarker(regex.NUMERIC_EN, {
    classNameFromProps: 'classNonNumeric',
    classNameFromClassNames: 'nonNumeric'
});

export const markNonNumeric = markNonEnNumeric;

export const markNonEuNumeric = getInverseMarker(regex.NUMERIC_EU, {
    classNameFromProps: 'classNonNumeric',
    classNameFromClassNames: 'nonNumeric'
});

export const markNonUint = getInverseMarker(regex.UINT, {
    classNameFromProps: 'classNonUint',
    classNameFromClassNames: 'nonUint'
});

export const markNonUrl = getInverseMarker(twttrTxt.regexen.extractUrl, {
    classNameFromProps: 'classNonUrl',
    classNameFromClassNames: 'nonUrl'
});

export const markUrls = getMatchMarker(twttrTxt.regexen.extractUrl, {
    classNameFromProps: 'classUrl',
    classNameFromClassNames: 'url'
});
