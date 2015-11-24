# TODO: A legit readme.

## In the meantime

The `txregions` package contains the `TxRegionsInput` component that is intended to be a drop-in replacement for an `<input>` of type `text`, `email`, or `url`.

Briefly, it can:
* Highlight invalid characters (given a suitable definition of valid)
  * Presets include:
    * email
    * url
    * number
    * number eu
    * int
    * uint
  * Invalid characters can also be defined via a regular expression or a function
* Highlight text that is past the `maxLength`
* Highlight URLs
* Highlight Email addresses
* Highlight any span of text as it is entered

Instances of `TxRegionsInput` can be configured to have a hidden `<input type="text" .../>` element, named whatever you want, which will always have the value entered into the `TxRegionsInput` as its value. Additionally, the `<input>`'s validity state will always reflect the current state of the `TxRegionsInput`. This way, the `TxRegionsInput` value can be submitted with a form.

It does not come with styling; it can be styled however you want to style it. There are a few styles applied for the demo, but they are just to illustrate how to style it.

## Examples

To set a `TxRegionsInput` to be valid only if a valid email address has been entered:

```
<TxRegionsInput
    placeholder="Enter an email address"
    input="email_address"
    preset="email"
    maxLength="255"
    required
/>
```

This `TxRegionsInput` is considered required, has a `maxLength` of 255 characters, and will only be a in "valid" state if it has a valid email address entered. For instance, entering `123` will cause it to be in an invalid state. By default, the invalid characters are wrapped in a `<span>`:

```
<span class="txr-invalid">123</span>
```

The `TxRegionsInput` above will also have a placeholder. The text of the placeholder is not selectable and would not be seen as a form value.

More details are to come, but there are some tricks done that make it fairly straight-forward to implement help tips on invalid values. An excerpt from the demo is shown below:

```
<TxRegionsInput
    setWrapperProps={{className: 'demo-item-wrapper'}}
    setEditableProps={{className: 'demo-item-editable'}}
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
```

With the following css styles:
```
.error-hint {
    color: #c00;
    font-size: 0.9em;
    margin-top: 0.15em;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.3s;
}

[data-ux-state~="focus-had"][data-violations~="digits"] > [data-hint-key="digits"],
[data-ux-state~="focus-had"][data-violations~="general"] > [data-hint-key="general"],
[data-ux-state~="focus-had"][data-violations~="required"] > [data-hint-key="required"],
[data-ux-state~="focus-had"][data-violations~="minLength"] > [data-hint-key="minLength"],
[data-ux-state~="focus-had"][data-violations~="maxLength"] > [data-hint-key="maxLength"] {
    max-height: 1.3em;
    opacity: 1;
}
```

The help tips are toggled when the `TxRegionsInput` loses focus and are hidden when it gains focus. They will only show after the first time it has had focus. Because this behavior (the focus related part) is defined only in CSS, it can be switched to whatever you want. Similar to the `ng-pristine` etc., CSS classes from Angular, the `TxRegionsInput` has a `[data-ux-state]` attribute that has one of the following from each set:
* To indicate the focus state:
  * `focus-never`
  * `focus-now`
  * `focus-had`
* To indicate if it has been modified by the user:
  * `changed-never`
  * `changed-done`

So, if it has focus and has been changed at least once by the user, the wrapping div of the will be dressed with:
```
data-ux-state="focus-now changed-done"
```

That can be used as styling hooks, as shown on the demo.

## HTML structure

The resulting HTML from the `<TxRegionsInput>` above (but without the validation messages) is:

```
<div
    class="demo-item-wrapper"
    data-ux-state="focus-never changed-never"
    data-reactid=".0.g">
    <input
        hidden=""
        type="text"
        name="email_address"
        value=""
        data-reactid=".0.g.0">
    <div
        data-placeholder="Enter an email address"
        class="demo-item-editable"
        spellcheck="false"
        contenteditable="true"
        data-reactid=".0.g.1"></div>
</div>
```


## Just want to note:

The structure of this repo and many of the build scripts, etc., are derived from https://github.com/rackt/react-router (License: https://github.com/rackt/react-router/blob/master/LICENSE.md)

The twitter-text.js code is a sub-set of the JavaScript twitter-text code at https://github.com/twitter/twitter-text/blob/master/js/twitter-text.js (License http://www.apache.org/licenses/LICENSE-2.0)

Also, the regular expression for matching emails is from http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (License http://www.w3.org/Consortium/Legal/2015/doc-license)
