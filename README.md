
# req's:
ask doug for
```
const creds = require("../config/zoom-recording-tracker-6a8bd724ca99.json");
```

# install:

```
cd zoom-recording-tracker
npm i

nano public/app.json
// update imap auth info
```


# config:

json config:
```
{
   "CONF": {
      "email": "no-reply@zoom.us",
```
      
// email that triggers parsing (i.e. no-reply@zoom.us)
```    
      "catchSubject": "Cloud Recording - Software Engineering Immersive SEI-TOR-37-9 is now available",
```
// CaSe SenSeTiVe subject line to trigger parsing
```      
      "sheet": "16idd4sncOsA5gtMSXfxE5R4QEgy2sgR7i32WfrlYZDY",
```
 google sheets id (note: bot needs write access to sheet, grant write access to below email)
 ```
 zoom-recording-tracker-bot@zoom-recording-tracker.iam.gserviceaccount.com
 ```
 
 imap auth info... self explanatory.  ensure your email supports imap
 ```
   },
   "IMAP": {
      "name": "your@email.com",
      "pass": "********",
      "host": "imap.gmail.com",
      "port": "993"
   }
}
```