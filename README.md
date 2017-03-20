# easyJetform - v3.0.0.0

Turn any form to a Jetform :)
[Demo](http://www.interjet.co.il/camp/interjet/easyjetform/v3/).

### Important
<b>jQuery:</b><br>
jQuery is required to work (any version is acceptable) <br>

<b>Markup:</b><br>
All the inputs should be wrapped in a container (e.g div) if you wish to present errors under each input. 

### Options
Name  | Type | Description
------------- | ------------- | -------------
token | String | The authentication token as revieved from Jetform. Default: ''
errorSelector | String | The element in which the errors will appear. Default: false
autoValidate | Boolean | Should perform a validation immediately when an instance is created. Default: false
autoSend | Boolean | Should send the data immediately when an instance is created. Default: false
resetErrorEvent | String | The gesture which will trigger the error reset (e.g click / keypress). Default: false
autoAlign | Boolean | Should automatically align the text according to the placeholder's or the value's direction. Default: true
url | String | The URL to which the form should be submited. Default: '//jetform.interjet.co.il/lead/save'

### Events
Name  | Description
------------- | -------------
beforeSubmit | Triggered before sending the input data to Jetform and after a successfull validation
onSuccess | Triggered after a successfull response came from Jetform
onError | Triggered if errors were found in the form validation
onFail | Triggered when an invalid response came from Jetform

### Validation rules
Name  | Description
------------- | -------------
min_length[2] | The minimal allowed length of the input's value
max_length[5] | The maximum allowed length of the input's value
exact_length[6] | The exact allowed length of the input's value
required | The field is required and must have a value
integer | The value of the field must be numeric only
valid_email | The value of the field must be a valid email
valid_url | The value of the field must be a valid URL (Strict mode)
valid_url[true] | The value of the field must be a valid URL (Loose mode)
valid_id_number | The value of the field must contain a valid id number

##### Validation example
```html
<div class="form-group">
    <label for="firstName">שם פרטי</label>
    <input type="text" id="full_name" name="jf_txt_1" data-validate="min_length[2]|max_length[4]">
</div>
```

##### Validation error detection
There are 2 ways to detect errors when they occured: <br>
<b>Class level event:</b> options.onError event will be triggered with an array of errors as a function argument
```js
onError: function(errors){
    console.log(errors);
}
```
<b>Element level event:</b> jetform.error event will be triggered with an error object as a function argument
```js
$('#full_name').on('jetform.error', function(event, error){
    console.log(error);
});
```

### Example
```js
$('#jetform').jetform({
    token:'nZq6scKaNvcXdgjszIcN1kaHhbYDKjAAie0yPKyTVU4AiE0Aiv9VGKu0sH7fVqWhqEkRvUyhbApBpYRGmgPkZA==',
    errorSelector: '.input-error',
    resetErrorEvent: 'keypress',
    onSuccess: function(){
        alert('I am the king of the world!');
    }
})
```