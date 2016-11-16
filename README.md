# easyJetform
                                                                              
דמו:
http://www.interjet.co.il/camp/interjet/easyjetform/

הסבר קצר-
-	התוסף לטפסים נגישים, עובד הכי טוב עם טופס שבנוי כמו בדוגמא לבוטסטארפ.
-	לתגית form צריך להוסיף תכונה novalidate. אחרת כרום מפריע לתהליך הולידציה.
-	לכל שדה צריך להיות תכונה name לפי העמודה בג'טפורם אליה היא שייכת.
-	חייב שיהיה label(אפשר להסתיר אותו בCSS במידה ובקמפיין רוצים רק PLACEHOLDER).
-	חייב שיהיה DIV שיעטוף את השדה והlabel.
-	במידה וזה שדה חובה להוסיף required לשדה.
-	חובה להעביר token בקריאה לפונקציה.
-	לא לשכוח לטעון את הcss.

כרגע ההגדרות שניתן לשנות זה:
alertErrors	True/false	במידה וTRUE ההודעות שגיאה יקפצו באלרטים(בדיפולט FALSE)
onSubmit	function()	מה לעשות בזמן שליחת הנתונים
onSuccess	function(args)	מה לעשות כאשר הליד נישלח בהצלחה(אובייקט ARGS מכיל את כל מה שנישלח)
onFail	function()	מה לעשות אם השליחה נכשלה

דוגמא לקריאה:
$('#jetform').jetform({
token:'nZq6scKaNvcXdgjszIcN1kaHhbYDKjAAie0yPKyTVU4AiE0Aiv9VGKu0sH7fVqWhqEkRvUyhbApBpYRGmgPkZA==',
alertErrors: true
})


מוזמנים להוסיף, לשפר ולהשתמש  
