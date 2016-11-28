# easyJetform
Turn any static form to a Jetform with one line. [Demo](http://www.interjet.co.il/camp/interjet/easyjetform/).
### Few Points
- ```<form>``` need to have a ```novalidate``` attribute
- Each input needs to have a ```name="..."``` attribute.
- Each input needs to have a ```<label for="...">```.
- A ```<div>``` needs to wrap the ```<label>``` and the ```<input>``` tags.
- If an input is required a ```required``` attribute should be added to the ```<input>```.
- Load CSS
### Options
Option  | Type | Description
------------- | ------------- | -------------
alertErrors  | Boolean | Default false, if true the errors will jump in alerts
submitLoader  | Boolean | Default false, if true a loader will jump while the details are sent
beforeSubmit | Function(args) | Default ```console.log('הפרטים נשלחו')```
onSuccess | Function(args) | Default ```alert('הפרטים נשלחו')```.
onFail | Function(error) | Default ```alert('השליחה נכשלה')```.
### Example
```
$('#jetform').jetform({
token:'nZq6scKaNvcXdgjszIcN1kaHhbYDKjAAie0yPKyTVU4AiE0Aiv9VGKu0sH7fVqWhqEkRvUyhbApBpYRGmgPkZA==',
alertErrors: true,
submitLoader: true
})
```