import React, { Component } from 'react';
import { render } from 'react-dom'

import TxRegionsInput, { getMatchMarker, markers } from 'txregions';


const editableProps = { className: 'editable' };

const DemoA = () => (
    <TxRegionsInput
        setEditableProps={editableProps}
        placeholder="Enter an email address"
        preset="email"
    />
);

const DemoB = () => (
    <TxRegionsInput
        setEditableProps={editableProps}
        placeholder="Enter more than three characters and change the focus"
        maxLength="3"
    />
);

const DemoC = () => (
    <TxRegionsInput
        setEditableProps={editableProps}
        placeholder="Enter a uint"
        validators={/\d+/}
    />
);

const DemoD = () => (
    <TxRegionsInput
        setEditableProps={{className: 'editable mad-styles'}}
        placeholder="Enter a numbers, e.g. -1,234 or 1.56"
        maxLength="10"
        preset="number"
        invalidClassName="mad-invalid"
    />
);

const DemoE = () => (
    <TxRegionsInput
        setEditableProps={editableProps}
        placeholder="Invalid entries also mark a hidden input as :invalid"
        required
        defaultValue="This is not a valid URL"
        preset="url"
        input="url_form_name"
    />
);

const DemoF = () => (
    <TxRegionsInput
        setEditableProps={editableProps}
        placeholder="3 to 10 in length"
        maxLength="10"
        minLength="3"
        defaultValue="This is too long"
    />
);

const DemoG = () => (
    <TxRegionsInput
        setEditableProps={editableProps}
        placeholder="Enter an email address"
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
);

class DemoH extends Component {
    constructor(props) {
        super(props);
        this.state = {
            substringRx: /go all the way/gi
        };
        // this._substringInput = undefined;
        this.handleUpdateDynamicMarker = this.handleUpdateDynamicMarker.bind(this);
    }

    handleUpdateDynamicMarker(event) {
        event.preventDefault();
        const elements = event.target.elements;
        let rx;
        try {
            rx = new RegExp(elements.rxInput.value, 'gi');
        } catch (err) {
            console.error(err);
            return;
        }
        this.setState({substringRx: rx});
    }

    render() {
        return (
            <div>
                <div>
                    <form className="rx-form" onSubmit={this.handleUpdateDynamicMarker}>
                        <code>/<input
                            type="text"
                            placeholder="find"
                            defaultValue="go all the way"
                            name="rxInput"
                        />/gi</code>
                    </form>
                    &nbsp; <small className="fine-print">Return to apply</small>
                </div>
                <TxRegionsInput
                    setEditableProps={editableProps}
                    defaultValue={`"If you're going to try, go all the way. Otherwise, don't even start. This could mean losing girlfriends, wives, relatives and maybe even your mind. It could mean not eating for three or four days. It could mean freezing on a park bench. It could mean jail. It could mean derision. It could mean mockery--isolation. Isolation is the gift. All the others are a test of your endurance, of how much you really want to do it. And, you'll do it, despite rejection and the worst odds. And it will be better than anything else you can imagine. If you're going to try, go all the way. There is no other feeling like that. You will be alone with the gods, and the nights will flame with fire. You will ride life straight to perfect laughter. It's the only good fight there is." -- Charles Bukowski, Factotum`}
                    dynamicMarkers
                    markers={getMatchMarker(this.state.substringRx, 'word-find')}
                />
            </div>
        );
    }
}

const DemoI = () => (
    <TxRegionsInput
        setEditableProps={editableProps}
        placeholder="All your base are belong to us"
        defaultValue="An email address: example@example.com, and a couple of URLs: google.com, https://www.google.com"
        markers={[markers.email, markers.urls]}
    />
);


class DemoJ extends Component {
    constructor(props) {
        super(props);
        this.state = { value: null };
        this.handleSetValue = this.handleSetValue.bind(this);
        this.handleRawChange = this.handleRawChange.bind(this);
    }

    handleSetValue(event) {
        event.preventDefault();
        const elements = event.target.elements;
        this.setState({ value: elements.valueInput.value });
    }

    handleRawChange(data) {
        this.setState({ value: data.raw });
    }

    render() {
        return (
            <div>
                <div>
                    <form className="set-value-form" onSubmit={this.handleSetValue}>
                        <input
                            type="text"
                            defaultValue="Hello World"
                            name="valueInput"
                        />
                    </form>
                    &nbsp; <small className="fine-print">Return to apply</small>
                </div>
                <TxRegionsInput
                    setEditableProps={editableProps}
                    placeholder="controlled"
                    maxLength="10"
                    value={this.state.value}
                    onRawChange={this.handleRawChange}
                />
            </div>
        );
    }
}


const demos = [
    [<DemoA />, 'js-demo-a'],
    [<DemoB />, 'js-demo-b'],
    [<DemoC />, 'js-demo-c'],
    [<DemoD />, 'js-demo-d'],
    [<DemoE />, 'js-demo-e'],
    [<DemoF />, 'js-demo-f'],
    [<DemoG />, 'js-demo-g'],
    [<DemoH />, 'js-demo-h'],
    [<DemoI />, 'js-demo-i'],
    [<DemoJ />, 'js-demo-j']
];

demos.forEach(([component, id]) => {
    render(component, document.getElementById(id));
});

document.getElementById('js-main-section').removeAttribute('hidden');
