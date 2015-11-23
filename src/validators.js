import { getInverseMarker } from './markers';
import { line } from './strings';
import { filteredMap, getIsRequiredChecker } from './utils';


export const validatorDefaults = {
    key: 'general',
    mark: true,
    className: 'txr-invalid'
};


const PROP_TYPE_ERR_MESSAGE = line(`
    Invalid "validators" prop, must be either a RegExp, function, config
    Object, or an Array of these. The config Object can have the optional
    property 'className: <string>' which would specify the className the
    validators the Object defines would mark characters with. The config Object
    may also have a 'mark: <boolean>' property which, if false, will prevent the
    validators specified by the config object from marking invalid text with a
    className. The config Object may have an arbitrary number of key/value pairs
    where the value should be a RegExp (must be a full-match) or a function
    returning a boolean (true indicates a failure) and the key is the string
    added to the [data-violations] attribute on the wrapping <div> if the RegExp
    or function fail. Note: if a function returns a value other than a boolean
    the value is converted to a string and added to the [data-violations]
    attribute.`);


function propValueCheck(value) {
    if (!value) {
        return 'Invalid value: ' + value;
    }
    if (typeof value === 'function') {
        return;
    }
    if (value instanceof RegExp) {
        return;
    }
    if (Array.isArray(value)) {
        return filteredMap(value, verifyPropValue).join('; ');
    }
    if (typeof value !== 'object') {
        return 'Invalid value: ' + value;
    }
    if ('mark' in value && typeof value.mark !== 'boolean') {
        return 'The "mark" property must be a boolean.';
    }
    if ('className' in value && typeof value.className !== 'string') {
        return 'The "className" property must be a string.';
    }
    return Object.keys(value).map(key => {
        if (!(value[key] instanceof RegExp) && typeof value[key] !== 'function') {
            return `Invalid property, ${key} must be a RegExp or function.`;
        };
    }).join('; ');
}


export function validatorsPropCheck(props, propName) {
    const value = props[propName];
    if (value == null) {
        return;
    }
    const msgs = propValueCheck(value);
    if (msgs) {
        return new Error(`${msgs} - ${PROP_TYPE_ERR_MESSAGE}`);
    }
}
validatorsPropCheck.isRequired = getIsRequiredChecker(validatorsPropCheck);


// Different forms the validator definition can take (in JSX):
//
//         validators={/\d+/}
//         validators={myTestFn}
//         validators={{digits: /\d+/, mark: false}}
//         validators={{upperLetters: /[A-Z]+/, lowerLetters: /[a-z]+/}}
//         validators={[
//             /\d+/,
//             myTestFn,
//             {testKey: myTestFn},
//             {digits: /\d+/, mark: false},
//             {upperLetters: /[A-Z]+/, lowerLetters: /[a-z]+/, className: 'invalid'},
//         ]}
export function makeValidators(value, invalidClassName) {
    invalidClassName = invalidClassName || validatorDefaults.className;
    switch (true) {
        case !value:
            throw new Error('Invalid validator value');

        case value instanceof RegExp:
            return new RxValidator(value, invalidClassName);

        case typeof value === 'function':
            return new FnValidator(value);

        case Array.isArray(value):
            const validatorArr = value.map(item => makeValidators(item, invalidClassName))
            return new ValidatorSeries(validatorArr);

        case typeof value === 'object':
            const
                mark = value.mark,
                className = value.className || invalidClassName,
                keys = Object.keys(value).filter(key => key !== 'mark' && key !== 'className'),
                validators = keys.map(key => {
                    const v = value[key];
                    if (v instanceof RegExp) {
                        return new RxValidator(v, className, key, mark);
                    } else if (typeof v === 'function') {
                        return new FnValidator(v, key);
                    } else {
                        throw new Error('Invalid validator value');
                    }
                });
            return new ValidatorSeries(validators);
    }
}


class RxValidator {
    constructor(
        rx,
        className=validatorDefaults.className,
        key=validatorDefaults.key,
        mark=validatorDefaults.mark
    ) {
        this.rx = rx;
        this.key = key;
        if (mark) {
            this.marker = getInverseMarker(this.rx, className);
        } else {
            this.marker = undefined;
        }
    }

    exec(text, markRange=undefined) {
        const ok = !text.replace(this.rx, '').length;
        if (ok) {
            return;
        }
        if (this.marker && markRange) {
            this.marker(text, markRange);
        }
        return this.key;
    }
}


class FnValidator {
    constructor(fn, key=validatorDefaults.key) {
        this.fn = fn;
        this.key = key;
    }

    exec(text, markRange) {
        const rv = this.fn(text, markRange);
        if (rv) {
            return typeof rv === 'boolean' ? this.key : '' + rv;
        }
    }
}


class ValidatorSeries {
    constructor(validators) {
        this.validators = validators;
    }

    exec(text, markRange) {
        return filteredMap(this.validators, v => v.exec(text, markRange)).join(' ');
    }
}
