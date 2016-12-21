# easyJetform - v1.2.5

Turn any form to a Jetform :)
[Demo](http://www.interjet.co.il/camp/interjet/easyjetform/).

### Important

- ```<form>``` needs to have a ```novalidate``` attribute
- Each input needs to have a ```name="..."``` attribute.
- Each input needs to have a ```<label for="...">```.
- A ```<div>``` needs to wrap the ```<label>``` and the ```<input>``` tags.
- Load CSS

### Extras

- If an input is required a ```required``` attribute should be added to the ```<input>```.
- If input is ID number add ```data-idnumber``` attribute.
- ```data-name="..."``` input name(for errors)
- ```data-error="..."``` to display custom error


### Options

Option  | Type | Description
------------- | ------------- | -------------
alertErrors  | Boolean | Default false, if true the errors will jump in alerts
submitLoader  | Boolean | Default false, if true a loader will jump while the details are sent
beforeSubmit | Function(args) | Default ```console.log('הפרטים נשלחו')```
onSuccess | Function(args) | Default ```alert('הפרטים נשלחו')```.
onFail | Function(error) | Default ```alert('השליחה נכשלה')```.
errorAtBottom | Boolean/selector | Default false, if true errors will be appended to the bottom, if selector the errors will append to the selector
validation | object | tel.min tel.max
template | Object | Templates for error messages(required,checkboxRequired,radioRequired,shortPhone,longPhone,inCorrectEmail,idNumber) {$field}/{$min}/{$max}

### Example

```
$('#jetform').jetform({
	token:'nZq6scKaNvcXdgjszIcN1kaHhbYDKjAAie0yPKyTVU4AiE0Aiv9VGKu0sH7fVqWhqEkRvUyhbApBpYRGmgPkZA==',
	alertErrors: true,
	submitLoader: true,
	errorAtBottom:true
})
```
