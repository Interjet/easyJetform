# easyJetform - v3.0.17

Turn any form to a Jetform :)
[Demo](https://interjet.github.io/easyJetform/).

### Important
<b>jQuery:</b><br>
jQuery is required to work (any version is acceptable) <br>

<b>Markup:</b><br>
All the inputs should be wrapped in a container (e.g div) if you wish to present errors under each input. <br>
Only inputs with ```name``` property will be processed.

### Options
Name  | Type | Description
------------- | ------------- | -------------
token | String | The authentication token as revieved from Jetform. Default: ''
errorSelector | String | The element selector in which the errors will appear. Default: false
successSelector | String | The element selector in which the success message will appear. Default: false
hideSuccessAfter | Integer | Number of seconds to display the success message. Default: false
redirect | Object / String | Redirect to a specific path after a cretin timeout. Default: false
autoValidate | Boolean | Should perform a validation immediately when an instance is created. Default: false
autoSend | Boolean | Should send the data immediately when an instance is created. Default: false
resetErrorEvent | String | The gesture which will trigger the error reset (e.g click / keypress). Default: false
live | Boolean | Live validation mode. errors are displayed as you type. Default: false
liveEvent | String | The event which will trigger the validation on each field. Default: 'keyup'
autoAlign | Boolean | Should automatically align the text according to the placeholder's or the value's direction. Default: true
telMaxLength | Integer | The maximum length of inputs of type tel
url | String | The URL to which the form should be submited. Default: '//jetform.interjet.co.il/lead/save'
privacyMode | Boolean | Removes identifiable metadata. default: false
requestType | String | The type of the HTTP request that should be sent. Default: 'text'
template | Object | The validation engine messages. You can add new or overwrite the existing messages
responses | Array | Array of possible responses definition. See detailed explanation bellow.
[spinner](#spinner) | Object | Properties for the spinner
[permit](#permit) | Object | Permission for input characters to a specific input type

### Events
Name  | Description
------------- | -------------
beforeSubmit | Triggered before sending the input data to Jetform and after a successful validation
onSuccess | Triggered after a successful response came from Jetform
onError | Triggered if errors were found in the form validation
onFail | Triggered when an invalid response came from Jetform or a 404 HTTP response status is received 

### Methods
Name  | Description
------------- | -------------
reset | Reset the form and restore the original state of the error messages

### Validation rules
Jetform plugin include a validation parser and a custom error message template engine. <br>
Validation rules are a string list separated by a pipe “|”. <br>

Name  | Description
------------- | -------------
min_length[2] | The minimal allowed length of the input's value
max_length[5] | The maximum allowed length of the input's value
exact_length[6] | The exact allowed length of the input's value
required | The field is required and must have a value
integer | The value of the field must be numeric only
alpha | The value of the field must contain alphbetic characters only
min_words[2] | The minimal allowed number of words in the input's value
max_words[5] | The maximum allowed number of words in the input's value
regexp[^[A-Za-z\s]+$] | The value must match the supplied regular expression
valid_email | The value of the field must be a valid email
valid_url | The value of the field must be a valid URL (Strict mode)
valid_url[true] | The value of the field must be a valid URL (Loose mode)
valid_id_number | The value of the field must contain a valid id number
equals[selector] | The value of the field must be equal to another field's value
in_list[a,b,c] | The value of the field must be one of the items
greater_than[3] | The minimum allowed value for the input
greater_than_equal_to[4] | Value must be greater or equal to
less_than[6] | The maximum allowed value for the input
less_than_equal_to[12] | Value must be less or equal to

##### Validation example
```html
<div class="form-group">
    <label for="firstName">Firstname</label>
    <input type="text" id="first_name" name="jf_txt_1" data-validate="min_length[2]|max_length[4]">
</div>
```

##### Function based validation rules
You can easily create your own validation function. <br>
The validation function should be avaliable in the window scope. <br>
Let's create a new function which checks the value of a given field: <br>
```js
function is_black(element) {
    return element.val() == '#000';
}
```
Now, we can start using it as a validation rule: <br>
```html
<div class="form-group">
    <label for="myColor">Choose color</label>
    <input type="text" id="myColor" name="colorPicker" data-validate="is_black">
</div>
```
Optionally, we can set an appropriate error message for the new rule: <br>
```js
$('form').jetform({
    template: {
        is_black: "{$field} is not black"
    }
});
```

##### Custom error messages
It is also possible to define a custom error message (ignoring the actual error) <br>
This error message will pop every time a validation rule failed to validate the field's value 
```html
<div class="form-group">
    <label for="fullname">Fullname</label>
    <input type="text" id="fullname" name="colorPicker" data-error="custom_error" data-validate="required|min_words[2]">
</div>
```
Don't forget to define the custom message's template: <br>
```js
$('form').jetform({
    template: {
        custom_error: "{$field} contain invalid value"
    }
});
```

##### Validation error detection
There are 2 ways to detect errors when they occure: <br>
<b>Class level event:</b> onError event will be triggered with an array of errors as a function argument
```js
onError: function(errors){
    console.log(errors);
}
```
<b>Element level event:</b> jetform.error event will be triggered with an error object as a function argument. <br>
Since each time only one validation error is desplayed for each field, the current error object will be passed as an argument.
```js
$('#full_name').on('jetform.error', function(event, error){
    console.log(error);
});
```

##### Error object
Each error is an object with the following properties: <br>

Name  | Description
------------- | -------------
field | A jQuery element object
rule | The name of the validation rule which failed the validation process
value | The value given in the rule for rules with values (otherwise equal to null)
message | A human readable message taken from the template after being parsed by the validation engine 

##### Extending the validation engine
You can easily extend the validation engine by teaching it new validation rules. <br>
Before creating a Jetform instance add a new validation rule by extending the Jetform.Utils interface: <br>
```js
Jetform.Utils.validations.is_dog = function(element){
    return element.val() == 'woof woof';
}
```
After creating the new validation rule, we need to setup the appropriate error message: <br>
```js
$('form').jetform({
    template: {
        is_dog: "{$field} is not a dog"
    }
});
```
Once we finished we can start using out new validation rule: <br>
```html
<div class="form-group">
    <label for="firstName">Fullname</label>
    <input type="text" id="full_name" name="jf_txt_1" data-validate="required|is_dog">
</div>
```

### prefix support
You can merge two inputs by adding ```data-prefix=#prefix-selector``` to the desired input. <br>

### responses
Array of objects. Each object contain a definition for a possible response <br>.
The Keys available for each object are:

Name  | Description
------------- | -------------
key | String - For text matching. Function for custom validation, should return boolean 
gtm_event | String. If defined a GTM event will be triggered with the collected data as variables
preCallback | String. Internal method to run before calling the callback
postCallback | String. The callback to run after the rule being matched, as defined in the options
arguments | Array. Array of public members to pass into the postCallback
template | String. The template of the response message passed into the postCallback as defined in the options

<br>
The default values match the responses of the Jetform system since this plugin serves the Jetform platform. <br>
This dynamic option is to allow users to use the plugin with other platforms. <br>

Defaults: <br> 
```js
responses: [
    {
        key: 'success',
        gtm_event: 'jetform_submit_success',
        preCallback: 'displaySuccess',
        postCallback: 'onSuccess',
        arguments: ['args']
    },
    {
        key: 'reason=unique',
        postCallback: 'onFail',
        template: 'unique'
    }
]
```

### spinner
You can control over the spinner that is shown in the input type submit while the data is being sent to Jetform. <br> 
The avaliable properties are: <br>

Name  | Description
------------- | -------------
active | Boolean.
width | String. The width of the spinner (e.g. 20px)
height | String. The height of the spinner (e.g. 20px)
color | String. Hexadecimal value for the color of the spinner. 
```js
spinner: {
    active: true,
    width: '30px',
    height: '20px',
    color: '#333'
}
```

### permit
You can disable certain characters from being typed in a certain input type. <br>
The permission is given by specifying a regular expression and an event to check the expression against the values of the input (usually it will be done on keypress). 
```js
permit: {
    email: {
        rule: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        event: 'keypress'
    }
}
```

### Jetform.Utils interface
Jetform.Utils is a static interface which is accessible from anywhere. <br>
The interface contains several general purpose methods and properties: <br>

Name  | Type | Description
------------- | ------------- | ------------- 
queryString | Method | Get a query string parameter
validations | Object | The validation rules (functions) used by the engine
postCORS | Method | Send an HTTP Cross-Origin POST request using xmlHttpRequest 2.0
getCORS | Method | Send an HTTP Cross-Origin GET request using xmlHttpRequest 2.0 

### Full example
```js
$('form').jetform({
    token:'nZq6scKaNvcXdgjszIcN1kaHhbYDKjAAie0yPKyTVU4AiE0Aiv9VGKu0sH7fVqWhqEkRvUyhbApBpYRGmgPkZA==',
    errorSelector: '.input-error',
    resetErrorEvent: 'keypress',
    onSuccess: function(args, response){
        alert('I am the king of the world!');
    },
    onError: function(errors){
        alert('Ooops... something went wrong');
    }
})
```

### Method calling example
```js
$('form').jetform('reset');
```