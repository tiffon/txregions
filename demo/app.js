import React, { Component } from 'react';
import { render } from 'react-dom'

import TxRegionsInput, { getMatchMarker, markers } from 'txregions';


export class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            caret: 0,
            value: '',
            substringRx: /the/gi
        };
        this._controlled = undefined;
        this._substringInput = undefined;
    }

    setValue() {
        const v = this._setInput ? this._setInput.value : '';
        console.log('setting to:', v);
        console.log('setting value, elm.state:', JSON.parse(JSON.stringify(this._controlled.state)))
        this.setState({value: this._setInput ? this._setInput.value : '' });
    }

    handleUpdateDynamicMarker(event) {
        var rx;
        event.preventDefault();
        console.log(this._substringInput);
        if (!this._substringInput) {
            console.log('no substring elm');
            return;
        }
        try {
            rx = new RegExp(this._substringInput.value, 'gi');
        } catch (err) {
            console.error(err);
            return;
        }
        console.log('new rx:', rx);
        this.setState({substringRx: rx});
        this.forceUpdate();
    }

    handleUpdate(data) {
        console.log('on update:');
        console.log('\t value:', data.component.clean);
        console.dir(data);
    }

    handleRawChange(data) {
        console.log('on APP change:', data.raw.replace(/\s/g, '|'));
        console.log('\t value:', this._controlled.clean);
        if (data.raw.indexOf('fuck') < 0) {
            this.setState({
                caret: data.caret,
                value: data.raw
            });
        }
    }

    render() {
        const
            wrapperProps = {
                className: 'demo-item-wrapper'
            },
            editableProps = {
                className: 'demo-item-editable',
                // TODO: figure out why spellCheck is being ignored
                spellCheck: 'false'
            };

        return (
            <div>

                Email address input <small className="fine-print">(preset="email")</small>
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="Enter an email address"
                    defaultValue="Has an invalid initial value"
                    input
                    preset="email"
                />

                Only uints are ok <small className="fine-print">(validation via a {'RegExp'})</small>
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="Enter a uint"
                    input
                    validators={{digits: /\d+/}}
                />

                Custom styles <small className="fine-print">(preset="number")</small>
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={{className: 'demo-item-editable mad-styles'}}
                    placeholder="Formatted numbers are ok"
                    input="meric"
                    maxLength="10"
                    preset="number"
                    invalidClassName="mad-invalid"
                />

                A required URL input <small className="fine-print">(preset="url")</small>
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="Invalid entries also mark a hidden input as :invalid"
                    input="another-name"
                    required
                    defaultValue="This is not a valid URL"
                    preset="url"
                />

                Min length = 3, max length = 10
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="3 to 10 in length"
                    maxLength="10"
                    minLength="3"
                    defaultValue="This is too long"
                    input
                />

                Add validation messages <small className="fine-print">(After the first focus)</small>
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="Enter an email address"
                    input
                    preset="email"
                    maxLength="255"
                    required
                >
                    <div className="error-hint" data-hint-key="minLength">This value must be at least 3 characters in length.</div>
                    <div className="error-hint" data-hint-key="maxLength">This value is too long (the max length is 255).</div>
                    <div className="error-hint" data-hint-key="required">This field is required.</div>
                    <div className="error-hint" data-hint-key="general">Please enter a valid email address.</div>
                </TxRegionsInput>

                Mark sub-strings <small className="fine-print">(valid regexes only)</small> &nbsp;
                <form style={{display: 'inline'}} onSubmit={this.handleUpdateDynamicMarker.bind(this)}>
                    <code>/<input
                        ref={elm => this._substringInput = elm}
                        type="text"
                        placeholder="find"
                        defaultValue="the"
                    />/gi</code>
                </form>
                &nbsp; Return to apply
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="Mark sub-strings"
                    input
                    defaultValue={`"If you're going to try, go all the way. Otherwise, don't even start. This could mean losing girlfriends, wives, relatives and maybe even your mind. It could mean not eating for three or four days. It could mean freezing on a park bench. It could mean jail. It could mean derision. It could mean mockery--isolation. Isolation is the gift. All the others are a test of your endurance, of how much you really want to do it. And, you'll do it, despite rejection and the worst odds. And it will be better than anything else you can imagine. If you're going to try, go all the way. There is no other feeling like that. You will be alone with the gods, and the nights will flame with fire. You will ride life straight to perfect laughter. It's the only good fight there is." -- Charles Bukowski, Factotum`}
                    dynamicMarkers
                    markers={getMatchMarker(this.state.substringRx, 'demo-word-find')}
                />

                Highlights URLs and email addresses <small className="fine-print">(when configured to do so)</small>
                <TxRegionsInput
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="All your base are belong to us"
                    input
                    defaultValue="Here is a highlighted email address: example@example.com, and a highlighted URL: google.com, and another: https://www.google.com"
                    markers={[markers.email, markers.urls]}
                />

                Use this to programattically change the value:
                {' '}
                <input type="text" placeholder="set value" ref={ref => this._setInput = ref} defaultValue="hello there, world" />
                {' '}
                <a href="javascript: void 0" onClick={this.setValue.bind(this)}>Set Value</a>
                <TxRegionsInput
                    ref={(comp) => window.hm = this._controlled = comp}
                    setWrapperProps={wrapperProps}
                    setEditableProps={editableProps}
                    placeholder="controlled"
                    maxLength="10"
                    input="some-name"
                    value={this.state.value}
                    onRawChange={this.handleRawChange.bind(this)}
                />
            </div>
        );
    }
}


render(<App />, document.getElementById('demo'));
