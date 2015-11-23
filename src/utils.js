

export function makeSelectionRange(node, textOffset) {
    var range,
        child,
        len,
        i;

    if (textOffset > node.textContent.length) {
        return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
        range = document.createRange();
        range.setStart(node, textOffset);
        return range;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        len = node.childNodes.length;
        i = 0;
        for (; i < len; i++) {
            child = node.childNodes[i];
            if (textOffset > child.textContent.length) {
                textOffset -= child.textContent.length;
            } else {
                return makeSelectionRange(child, textOffset);
            }
        }
    }
}


export function filteredMap(arr, fn) {
    const
        rv = [],
        max = arr.length;
    let i = 0,
        v;
    for (; i < max; i++) {
        v = fn(arr[i]);
        if (v != null) {
            rv.push(v);
        }
    }
    return rv;
}


export function getIsRequiredChecker(checker) {
    return function requiredChecker(props, propName) {
        if (props[propName] == null) {
            return new Error(`Invalid prop: ${propName} is required.`);
        }
        return checker(props, propName);
    }
}


export function numericPropCheck(props, propName) {
    const value = props[propName];
    if (value == null) {
        return;
    }
    if (isNaN(+value)) {
        return new Error('Invalid: Number or numeric String required');
    }
}
numericPropCheck.isRequired = getIsRequiredChecker(numericPropCheck);


export function positiveNumericPropCheck(props, propName) {
    const value = props[propName];
    if (value == null) {
        return;
    }
    if (isNaN(+value)) {
        return new Error(`Invalid: ${propName} must be a Number or numeric String`);
    } else if (+value < 1) {
        return new Error(`Invalid: ${propName} must be greater than 1`);
    }
}
positiveNumericPropCheck.isRequired = getIsRequiredChecker(positiveNumericPropCheck);
