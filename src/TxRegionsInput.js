import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MarkedRanges from './MarkedRanges';
import { markEmail, markUrls } from './markers';
import { combineValidators } from './presets';
import { foldWhitespace, KEY_CODES } from './strings';
import { filteredMap, makeSelectionRange, positiveNumericPropCheck } from './utils';
import { makeValidators, validatorDefaults, validatorsPropCheck } from './validators';


const noOp = function(){};

const warnFn = (console.error || console.warn || console.log || function(){}).bind(console);

const getPatternValidator = (function() {
    const cache = {};
    function getPatternValidator(value) {
        if (value in cache) {
            return cache[value];
        }
        let rx;
        try {
            rx = new RegExp(value);
        } catch (error) {
            warnFn(`Invalid pattern regex: ${error}\n${error.stack}`);
            return;
        }
        return cache[value] = makeValidators({pattern: rx});
    }
    return getPatternValidator;
})();


export const classNames = {
    email: 'txr-email',
    nonDigits: 'txr-non-digit txr-invalid',
    nonEmail: 'txr-non-email txr-invalid',
    nonInt: 'txr-non-int txr-invalid',
    nonNumeric: 'txr-non-numeric txr-invalid',
    nonUint: 'txr-non-uint txr-invalid',
    nonUrl: 'txr-non-url txr-invalid',
    tooLong: 'txr-too-long txr-invalid',
    url: 'txr-url'
};


export default class TxRegionsInput extends Component {


    constructor(props) {
        super(props);
        const
            initialValue = props.defaultValue || props.value || '',
            validators = combineValidators(props.validators, props.preset);
        this.state = {
            clean: '',
            cleanCaretPos: 0,
            hasFocus: false,
            raw: initialValue,
            rawCaretPos: 0
        };

        this._valueHistory = [initialValue];
        this._caretHistory = [0];
        this._historyPos = 0;
        this._wrapper = undefined;
        this._elm = undefined;
        this._input = undefined;
        // for checking if the content has changed
        this._txContent = undefined;
        // track number of descendants bc <enter> causes <div><br></div>
        // to be inserted on [contenteditable] elements but does not affect
        // the `textContent` of the [contenteditable] element
        this._numDescendants = undefined;
        this._marker = new MarkedRanges();
        this._markFn = [this._marker.markRange.bind(this._marker)];
        // ux state related properties
        this._uxInitialValue = initialValue;
        this._uxValueChanged = false;
        this._uxHadFocus = false;
        // validity related
        if (validators) {
            this._validators = makeValidators(validators, props.invalidClassName);
        } else {
            this._validators = undefined;
        }
        this._violations = undefined;
        // cache the foldWhitespace processing of state.raw
        this._cleanCacheSrc = undefined;
        this._cleanCacheValue = undefined;
    }

    get clean() {
        if (this.state.raw === this._cleanCacheSrc) {
            return this._cleanCacheValue;
        }
        this._cleanCacheSrc = this.state.raw;
        return this._cleanCacheValue = foldWhitespace(this._cleanCacheSrc);
    }

    get raw() {
        return this.state.raw;
    }


    _stepBackInHistory() {
        const
            max = this._valueHistory.length - 1,
            raw = this.state.raw,
            caret = this.state.rawCaretPos;
        var r,
            c;
        while (this._historyPos < max) {
            this._historyPos++;
            r = this._valueHistory[this._historyPos];
            c = this._caretHistory[this._historyPos];
            if (r !== raw || c !== caret) {
                this._setRaw(r, c, true);
                return;
            }
        }
    }


    _stepForwardInHistory() {
        const
            raw = this.state.raw,
            caret = this.state.rawCaretPos;
        var r,
            c;
        while (this._historyPos > 0) {
            this._historyPos--;
            r = this._valueHistory[this._historyPos];
            c = this._caretHistory[this._historyPos];
            if (r !== raw || c !== caret) {
                this._setRaw(r, c, true);
                return;
            }
        }
    }


    _addToHistory(value, caret) {
        const maxHistory = +this.props.maxHistory;
        if (this._historyPos) {
            // have already stepped back in history, so need to clear
            // a bit of history before adding to the history
            this._valueHistory.splice(0, this._historyPos);
            this._caretHistory.splice(0, this._historyPos);
            this._historyPos = 0;
        }
        this._valueHistory.unshift(value);
        this._caretHistory.unshift(caret);
        if (maxHistory && this._valueHistory.length > maxHistory) {
            this._valueHistory.length = maxHistory;
            this._caretHistory.length = maxHistory;
        }
    }


    _updateViolations(markRange) {
        const
            clean = this.clean,
            max = +this.props.maxLength,
            min = +this.props.minLength,
            pattern = this.props.pattern,
            isRequired = !!this.props.required,
            shouldMark = !('markInvalid' in this.props) || !!this.props.markInvalid ? true : undefined,
            invalidClassName = this.props.invalidClassName || validatorDefaults.className;

        let value = this._validators ? this._validators.exec(clean, shouldMark && markRange) : '';

        if (max && max > 0 && clean.length > max) {
            value += ' maxLength';
            if (shouldMark && markRange) {
                markRange(max, clean.length, invalidClassName);
            }
        }
        if (clean.length && min && min > 0 && min > clean.length) {
            value += ' minLength';
            if (shouldMark && markRange) {
                markRange(0, clean.length, invalidClassName);
            }
        }
        if (pattern) {
            const patternValidator = getPatternValidator(pattern);
            if (patternValidator) {
                const patternViolation = patternValidator.exec(clean, shouldMark && markRange);
                if (patternViolation) {
                    value += ` ${patternViolation}`;
                }
            }
        }
        if (isRequired && !clean) {
            value += ' required';
        }
        this._violations = value;
    }


    _setRaw(value, caret, focus) {
        if (this.props.onRawChange) {
            this.props.onRawChange({
                caret: caret,
                raw: value
            });
        }
        if (!('value' in this.props)) {
            this.setState({
                hasFocus: focus,
                raw: value,
                rawCaretPos: caret
            })
        } else if (!('caret' in this.props)) {
            this.setState({
                hasFocus: focus,
                rawCaretPos: caret
            });
        }
    }


    _findSelectionOffset() {
        var sel = document.getSelection(),
            rng = sel.rangeCount && sel.getRangeAt(0),
            node = rng && rng.endContainer,
            offset = rng && rng.endOffset;

        if (!rng) {
            return undefined;
        }

        if (!this._elm.contains(node)) {
            return 0;
        }
        while (node !== this._elm) {
            while (node.previousSibling) {
                node = node.previousSibling;
                if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                    offset += node.textContent.length;
                }
            }
            node = node.parentNode;
        }
        return offset;
    }


    _setSelection() {
        var sel = document.getSelection(),
            str = this.state.raw.slice(0, this.state.rawCaretPos),
            cleanCaretPos = foldWhitespace(str).length,
            range = makeSelectionRange(this._elm, cleanCaretPos)

        if (!range) {
            range = document.createRange();
            range.selectNodeContents(this._elm);
            range.collapse(false);
        }
        sel.removeAllRanges();
        sel.addRange(range);
    }


    _forceHtml() {
        const
            clean = this.clean,
            markFn = this._markFn[0];

        let markers = this.props.markers,
            i,
            ci,
            rng,
            tx,
            span,
            rngClasses;

        this._elm.innerHTML = '';
        if (!clean) {
            this._txContent = this._elm.textContent;
            this._numDescendants = this._elm.childNodes.length;
            return '';
        }
        this._marker.reset();
        if (typeof markers === 'function') {
            markers = [markers];
            i = 1;
        } else {
            i = markers ? markers.length : 0;
        }
        while (i--) {
            markers[i](clean, markFn, this, classNames);
        }
        // process the violations -- pass the marker function so the validators
        // can (optionally) mark the invalid text
        this._updateViolations(markFn);

        const
            ranges = this._marker.getRanges(),
            rmax = ranges.length,
            frag = document.createDocumentFragment();

        i = 0;
        ci = 0;
        for (; i < rmax; i++) {
            rng = ranges[i];
            if (rng.start > ci) {
                tx = document.createTextNode(clean.slice(ci, rng.start));
                frag.appendChild(tx);
            }
            span = document.createElement('span');
            rngClasses = rng.classes.join(' ').split(/\s+/g);
            span.classList.add.apply(span.classList, rngClasses);
            span.textContent = clean.slice(rng.start, rng.end);
            frag.appendChild(span);
            ci = rng.end;
        }
        if (ci < clean.length) {
            tx = document.createTextNode(clean.slice(ci));
            frag.appendChild(tx);
        }

        this._elm.appendChild(frag);
        this._txContent = this._elm.textContent;
        this._numDescendants = this._elm.querySelectorAll('*').length;
        // set the violations
        if (this._violations) {
            this._wrapper.setAttribute('data-violations', this._violations);
        } else {
            this._wrapper.removeAttribute('data-violations');
        }
    }


    _emitUpdate() {
        var data;
        if (typeof this.props.onUpdate !== 'function') {
            return;
        }
        data = {
            clean: this.clean,
            component: this,
            isValid: !this._violations,
            raw: this.state.raw,
            violations: this._violations || undefined
        };
        if (this._input) {
            data.input = this._input;
            data.value = this._input.value;
        }
        this.props.onUpdate(data);
    }


    _handleChange() {
        // if a change occurred, note the new text and caret position
        const
            raw = this._elm.textContent,
            numDescendants = this._elm.querySelectorAll('*').length,
            hasFocus = this._elm === document.activeElement,
            caretPos = this._findSelectionOffset();
        // if nothing changed, ignore this callback
        if (raw === this._txContent && numDescendants === this._numDescendants) {
            return;
        }
        this._uxValueChanged = true;
        // reset the content back to the last known state
        this._forceHtml();
        if (hasFocus) {
            this._setSelection();
        }
        this._setRaw(raw, caretPos, hasFocus);
    }


    _handleFocus() {
        this._uxHadFocus = true;
        // setting the state in the onFocus handler directly clobbers the
        // initial cursor position, so set the state asynchronously
        setTimeout(() => {
            this.setState({
                hasFocus: true,
                rawCaretPos: this._findSelectionOffset()
            }, 0);
        })
    }


    _handleBlur() {
        this.setState({hasFocus: false});
    }


    _handleKeyDown(event) {
        if (event.keyCode === KEY_CODES.ENTER) {
            event.preventDefault();
            if (this.props.onEnterKeyDown) {
                const data = {
                    metaKey: event.metaKey,
                    shiftKey: event.shiftKey,
                    clean: this.clean,
                    component: this,
                    isValid: !this._violations,
                    raw: this.state.raw,
                    violations: this._violations || undefined
                };
                if (this._input) {
                    data.input = this._input;
                    data.value = this._input.value;
                }
                this.props.onEnterKeyDown(data);
            }
        } else if (event.metaKey && event.keyCode === KEY_CODES.Z) {
            event.preventDefault();
            this._isUndo = true;
            if (event.shiftKey) {
                this._stepForwardInHistory();
            } else {
                this._stepBackInHistory();
            }
        }
    }


    componentDidMount() {
        this._uxInitialValue = this.props.defaultValue || this.props.value || '';
        this.setState({
            raw: this._uxInitialValue,
            rawCaretPos: 0
        });
        if (this._input) {
            this._input.value = this._uxInitialValue;
        }
        this._forceHtml();
        if (this._input) {
            // mark the input as `:invalid` if there are violations
            this._input.setCustomValidity(this._violations || '');
        }
        this._emitUpdate();
    }


    componentWillReceiveProps(nextProps, nextState) {
        if ('value' in nextProps) {
            this.setState({raw: nextProps.value});
        }
    }


    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextState.hasFocus !== this.state.hasFocus ||
            nextState.raw !== this.state.raw ||
            nextState.rawCaretPos !== this.state.rawCaretPos ||
            !!this.props.dynamicMarkers && this.props.markers !== nextProps.markers
        );
    }


    componentWillUpdate(nextProps, nextState) {
        this._updateViolations();
    }


    componentDidUpdate() {
        this._forceHtml();

        if (this.state.hasFocus && this.state.rawCaretPos != null) {
            this._setSelection();
        }
        if (this._isUndo) {
            this._isUndo = false;
        } else {
            this._addToHistory(this.state.raw, this.state.hasFocus ? this.state.rawCaretPos : this.state.raw.length);
        }
        if (this._input) {
            // mark the input as `:invalid` if there are violations
            this._input.setCustomValidity(this._violations || '');
        }
        this._emitUpdate();
    }


    render() {
        const
            p = this.props,
            clean = this.clean,
            editableProps = p.setEditableProps || {},
            wrapperProps = p.setWrapperProps || {},
            violations = this._violations ? {'data-violations': this._violations} : {};


        editableProps.contentEditable = true;

        let uxFocus,
            uxChanged,
            input,
            inputProps;

        uxChanged = this._uxValueChanged ? 'changed-done' : 'changed-never';
        if (this.state.hasFocus) {
            uxFocus = 'focus-now ';
        } else if (this._uxHadFocus) {
            uxFocus = 'focus-had ';
        } else {
            uxFocus = 'focus-never ';
        }

        if (p.input) {
            inputProps = p.setInputProps || {};
            input = (
                // Use input type="text" so can still manage the validity
                // (`:invalid`) manually (type="hidden" ignore custom validity).
                // The `hidden` attribute takes care of making it invisible. Use
                // a `noOp` onChange handler to get rid of the react warning.
                <input
                    ref={(elm) => this._input = elm}
                    hidden
                    type="text"
                    onChange={noOp}
                    name={typeof p.input === 'string' ? p.input : ''}
                    value={clean.trim()}
                    {...inputProps} />
            );
        }
        return (
            <div
                ref={elm => this._wrapper = elm}
                {...wrapperProps}
                {...violations}
                data-ux-state={uxFocus + uxChanged}
            >
                {input}
                <div
                    ref={(elm) => this._elm = elm}
                    onBlur={this._handleBlur.bind(this)}
                    onFocus={this._handleFocus.bind(this)}
                    onInput={this._handleChange.bind(this)}
                    onKeyDown={this._handleKeyDown.bind(this)}
                    data-placeholder={clean ? '' : p.placeholder}
                    spellCheck={p.spellCheck}
                    {...editableProps} />
                {p.children}
            </div>
        );
    }
}

TxRegionsInput.propTypes = {
    defaultValue: PropTypes.string,
    dynamicMarkers: PropTypes.bool,
    input: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    invalidClassName: PropTypes.string,
    markers: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
    markInvalid: PropTypes.bool,
    maxHistory: positiveNumericPropCheck,
    maxLength: positiveNumericPropCheck,
    minLength: positiveNumericPropCheck,
    pattern: PropTypes.string,
    onEnterKeyDown: PropTypes.func,
    onUpdate: PropTypes.func,
    onRawChange: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    setEditableProps: PropTypes.object,
    setInputProps: PropTypes.object,
    setWrapperProps: PropTypes.object,
    spellCheck: PropTypes.bool,
    validators: validatorsPropCheck,
    value: PropTypes.string,
};

TxRegionsInput.defaultProps = {
    defaultValue: '',
    markers: undefined,
    maxHistory: 100,
    placeholder: '',
    spellCheck: false
};

TxRegionsInput.defaultMarkers = TxRegionsInput.defaultProps.markers;
