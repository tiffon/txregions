

export const KEY_CODES = Object.freeze({
    ENTER: 13,
    Z: 90
});


export function line(str, skipTrim) {
    const s = str.replace(/\s+/g, ' ');
    return skipTrim ? s : s.trim();
}


export function foldWhitespace(str) {
    return str
        .replace(/^\s+/, '')        // no leading spaces
        .replace(/\s/g, ' ')        // only allow spaces, not tabs, new lines, etc
        .replace(/ {3,}/g, '  ');   // no more than 2 spaces anywhere
}
