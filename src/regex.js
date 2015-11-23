
// EMAIl regex is a variation of the regex found here:
// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
export const EMAIL = /[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/;

export const EMAIL_GLOBAL = new RegExp(EMAIL.source, 'g');

export const NUMERIC_EN = /-?\d{1,3}(?:(?:,?\d\d\d)+|\d*)(?:\.\d+)?/;

export const NUMERIC_EU = /-?\d{1,3}(?:(?:[\. ]?\d\d\d)+|\d*)(?:,\d+)?/;

export const INT = /-?\d+/;

export const UINT = /\d+/;
