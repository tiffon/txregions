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
                className: 'ss-demo-item-wrapper'
            },
            editableProps = {
                className: 'demo-item-editable',
                // TODO: figure out why spellCheck is being ignored
                spellCheck: 'false'
            };

        return (
            <section>
                <div className="demo-item-wrapper">
                    <h1>Email address input <small className="fine-print">(preset="email")</small></h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    placeholder="Enter an email address"
    input
    preset="email"
/>`                 }</code></pre>
                    <TxRegionsInput
                        setEditableProps={editableProps}
                        placeholder="Enter an email address"
                        input
                        preset="email"
                    />
                </div>
                <div className="demo-item-wrapper">
                    <h1>Validation via a RegExp <small className="fine-print">(<code>/\d+/</code>)</small></h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    placeholder="Enter a uint"
    input="form_name_uint"
    validators={/\\d+/}
/>`                 }</code></pre>
                    <TxRegionsInput
                        setEditableProps={editableProps}
                        placeholder="Enter a uint"
                        input="form_name_uint"
                        validators={/\d+/}
                    />
                </div>
                <div className="demo-item-wrapper">
                    <h1>Custom styles</h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    setEditableProps={{className: 'demo-item-editable mad-styles'}}
    placeholder="Formatted numbers are ok"
    input="form_name_numeric"
    maxLength="10"
    preset="number"
    invalidClassName="mad-invalid"
/>`                 }</code></pre>
                    <TxRegionsInput
                        setEditableProps={{className: 'demo-item-editable mad-styles'}}
                        placeholder="Enter a numbers, e.g. -1,234 or 1.56"
                        input="form_name_numeric"
                        maxLength="10"
                        preset="number"
                        invalidClassName="mad-invalid"
                    />
                </div>
                <div className="demo-item-wrapper">
                    <h1>A required URL input</h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    placeholder="Invalid entries also mark a hidden input as :invalid"
    input="another-name"
    required
    defaultValue="This is not a valid URL"
    preset="url"
/>`                 }</code></pre>
                    <TxRegionsInput
                        setEditableProps={editableProps}
                        placeholder="Invalid entries also mark a hidden input as :invalid"
                        input="another-name"
                        required
                        defaultValue="This is not a valid URL"
                        preset="url"
                    />
                </div>
                <div className="demo-item-wrapper">
                    <h1>Min length = 3, max length = 10</h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    placeholder="3 to 10 in length"
    maxLength="10"
    minLength="3"
    defaultValue="This is too long"
    input
/>`                 }</code></pre>
                    <TxRegionsInput
                        setEditableProps={editableProps}
                        placeholder="3 to 10 in length"
                        maxLength="10"
                        minLength="3"
                        defaultValue="This is too long"
                        input
                    />
                </div>
                <div className="demo-item-wrapper">
                    <h1>
                        Add validation messages — updated after focus <br />
                        <small className="fine-print">(minLength, maxLength, email preset, required)</small>
                    </h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    placeholder="Enter an email address"
    input
    preset="email"
    maxLength="64"
    minLength="3"
    required
>
    <div className="error-hint" data-hint-key="minLength">This value must be at least 3 characters in length.</div>
    <div className="error-hint" data-hint-key="maxLength">This value is too long (the max length is 255).</div>
    <div className="error-hint" data-hint-key="required">This field is required.</div>
    <div className="error-hint" data-hint-key="general">Please enter a valid email address.</div>
</TxRegionsInput>`  }</code></pre>
                    <TxRegionsInput
                        setEditableProps={editableProps}
                        placeholder="Enter an email address"
                        input
                        preset="email"
                        maxLength="64"
                        minLength="3"
                        required
                    >
                        <div className="error-hint" data-hint-key="minLength">This value must be at least 3 characters in length.</div>
                        <div className="error-hint" data-hint-key="maxLength">This value is too long (the max length is 255).</div>
                        <div className="error-hint" data-hint-key="required">This field is required.</div>
                        <div className="error-hint" data-hint-key="general">Please enter a valid email address.</div>
                    </TxRegionsInput>
                </div>
                <div className="demo-item-wrapper">
                    <h1>
                        Dynamically mark sub-strings <small className="fine-print">(valid regexes only)</small> &nbsp;
                        <form style={{display: 'inline'}} onSubmit={this.handleUpdateDynamicMarker.bind(this)}>
                            <code>/<input
                                ref={elm => this._substringInput = elm}
                                type="text"
                                placeholder="find"
                                defaultValue="the"
                            />/gi</code>
                        </form>
                        &nbsp; <small className="fine-print">Return to apply</small>
                    </h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    defaultValue={"If you're going to try, go all the way. Otherwise, ..."}
    dynamicMarkers
    markers={getMatchMarker(this.state.substringRx, 'demo-word-find')}
/>`                 }</code></pre>
                    <TxRegionsInput
                        setEditableProps={editableProps}
                        defaultValue={`"If you're going to try, go all the way. Otherwise, don't even start. This could mean losing girlfriends, wives, relatives and maybe even your mind. It could mean not eating for three or four days. It could mean freezing on a park bench. It could mean jail. It could mean derision. It could mean mockery--isolation. Isolation is the gift. All the others are a test of your endurance, of how much you really want to do it. And, you'll do it, despite rejection and the worst odds. And it will be better than anything else you can imagine. If you're going to try, go all the way. There is no other feeling like that. You will be alone with the gods, and the nights will flame with fire. You will ride life straight to perfect laughter. It's the only good fight there is." -- Charles Bukowski, Factotum`}
                        dynamicMarkers
                        markers={getMatchMarker(this.state.substringRx, 'demo-word-find')}
                    />
                </div>
                <div className="demo-item-wrapper">
                    <h1>Highlights URLs and email addresses <small className="fine-print">(when configured to do so)</small></h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`import TxRegionsInput, { markers } from 'txregions';


<TxRegionsInput
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    placeholder="All your base are belong to us"
    defaultValue="An email address: example@example.com, and a couple of URLs: google.com, https://www.google.com"
    markers={[markers.email, markers.urls]}
/>`                 }</code></pre>
                    <TxRegionsInput
                        setEditableProps={editableProps}
                        placeholder="All your base are belong to us"
                        defaultValue="An email address: example@example.com, and a couple of URLs: google.com, https://www.google.com"
                        markers={[markers.email, markers.urls]}
                    />
                </div>
                <div className="demo-item-wrapper">
                    <h1>
                        Controlled input — Programmatically set the value
                        {' '}
                        <input type="text" placeholder="set value" ref={ref => this._setInput = ref} defaultValue="hello there, world" />
                        {' '}
                        <a href="javascript: void 0" onClick={this.setValue.bind(this)}>Set Value</a>
                    </h1>
                    <pre className="code-wrapper"><code className="code-snippet">{
`<TxRegionsInput
    ref={(comp) => window.hm = this._controlled = comp}
    setEditableProps={{ className: 'demo-item-editable', spellCheck: 'false' }}
    placeholder="controlled"
    maxLength="10"
    value={this.state.value}
    onRawChange={this.handleRawChange.bind(this)}
/>`                 }</code></pre>
                    <TxRegionsInput
                        ref={(comp) => window.hm = this._controlled = comp}
                        setEditableProps={editableProps}
                        placeholder="controlled"
                        maxLength="10"
                        value={this.state.value}
                        onRawChange={this.handleRawChange.bind(this)}
                    />
                </div>
            </section>
        );
    }
}


render(<App />, document.getElementById('demo'));
