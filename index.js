let conf = require("./config/conf.json").CONF;
let imapEnv = require("./config/conf.json").IMAP;
let sheetParams = require("./config/conf.json").SHEET;
let inbox = require("inbox");
const simpleParser = require('mailparser').simpleParser;

const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./config/zoom-recording-tracker-6a8bd724ca99.json");

/* DIRTY REGEX FOR PULLING THE URL AND PASSWORD */
const regex = /(?<=share this recording with viewers\:\n)(.*)|(?<=Passcode\:\n)(.*)/g;
/* ----------------------------- */
// readXML.loadDoc();
var client = inbox.createConnection(false, imapEnv.host, {
  secureConnection: true,
  auth: {
    user: imapEnv.name,
    pass: imapEnv.pass,
  },
});

client.connect();

client.on("connect", function () {
  console.log(`connected to ${imapEnv.host}`);
  client.openMailbox("INBOX", { readOnly: true }, function (error, info) {
    if (error) throw error;
    console.log("listening on inbox");
  });
});

client.on("new", async function (message) {

  try {
    let messageStream = await client.createMessageStream(message.UID);
    let messageParsed = await simpleParser(messageStream);
    //body: messageParsed.text 
    //from: messageParsed.from
    //subject: messageParsed.subject
    
     if (message.from.address == conf.email && messageParsed.subject == conf.catchSubject) {
      let bodyParsed = messageParsed.text.match(regex);
      if (bodyParsed && bodyParsed.length === 2){
        try {
          let sheet = await sheetsConnect();
          await updateRow(sheet, bodyParsed);
        } catch (err) {
          console.log(err);
        }
        
      } 
    }
    
  } catch (err) {
    console.log(err);
  }
});

/* rows = total rows in cell selection
  column = column id to check for empty val
  start = header column position (i.e. "URL" )
*/
function firstEmptyRow(sheet) {
  for (let i = sheetParams.headerRow; i < sheet.gridProperties.rowCount; i++) {
    let thisCell = sheet.getCell(i, sheetParams.urlCol);
    if (thisCell.value === null) {
      return i;
    }
  }
}
/* 
  using first empty row, populate with values passed from imap checker
*/
async function updateRow(sheet, parsedMessage, topic = "UPDATE TOPIC") {
  try {
    await sheet.loadCells("A:D");
    let newRow = firstEmptyRow(sheet);
    sheet.getCell(
      newRow,
      sheetParams.dateCol
    ).value = new Date().getDateForHTML();
    sheet.getCell(newRow, 1).value = require("./topic.json").TOPIC;
    sheet.getCell(newRow, sheetParams.passCol).value = parsedMessage[1];
    sheet.getCell(newRow, sheetParams.urlCol).value = parsedMessage[0];
    sheet.saveUpdatedCells();
  } catch (err) {
    console.log(err);
  }
}

async function sheetsConnect() {
  try {
    const doc = new GoogleSpreadsheet(sheetParams.id);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    return doc.sheetsByIndex[0];
  } catch (err) {
    console.log(err);
  }
}
Date.prototype.getDateForHTML = function () {
  return `${this.getUTCFullYear()}/${(this.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}/${this.getUTCDate().toString().padStart(2, "0")}`;
};
