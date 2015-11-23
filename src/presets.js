import twttrTxt from './vendor/twitter-text';
import * as regex from './regex';


const
    PRESETS = {
        // must use the non-global RegExp
        email: regex.EMAIL,
        // make a non-global URL RegExp
        url: new RegExp(twttrTxt.regexen.extractUrl.source, 'i'),
        number: regex.NUMERIC_EN,
        'number eu': regex.NUMERIC_EU,
        int: regex.INT,
        uint: regex.UINT
    },
    PRESET_KEYS = '"' + Object.keys(PRESETS).join('", "') + '"';


export function combineValidators(validators, preset) {
    var rx;
    if (!preset) {
        return validators;
    }
    rx = PRESETS[preset];
    if (!rx) {
        throw new Error(`Invalid validator preset: ${preset}, must be one of ${PRESET_KEYS}`);
    } else if (!validators) {
        return rx;
    } else if (Array.isArray(validators)) {
        return validators.concat([rx]);
    } else {
        return [validators, rx];
    }
}
