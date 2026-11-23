/**
 * LESCC story vote: Google Apps Script web app bound to a Google Sheet.
 *
 * POST  body (text/plain JSON): {"choice": "food_truck" | "cultural_center"}
 *       -> appends [timestamp, choice] to the "votes" sheet, returns the tally.
 * GET   -> returns the tally: {"food_truck": n, "cultural_center": n}
 *
 * No personal data is stored: no IP, no name, no browser id. One vote per
 * browser is enforced client-side only; this is a self-selected poll, and the
 * story says so on the results card.
 */
var SHEET_NAME = "votes";
var CHOICES = ["food_truck", "cultural_center"];
var MAX_BODY = 200;

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(["timestamp", "choice"]);
  return sh;
}

function tally_() {
  var sh = sheet_();
  var out = { food_truck: 0, cultural_center: 0 };
  var n = sh.getLastRow() - 1;
  if (n <= 0) return out;
  var rows = sh.getRange(2, 2, n, 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (out.hasOwnProperty(rows[i][0])) out[rows[i][0]] += 1;
  }
  return out;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_(tally_());
}

function doPost(e) {
  var body = (e && e.postData && e.postData.contents) || "";
  if (body.length > MAX_BODY) return json_({ error: "bad request" });
  var choice;
  try {
    choice = JSON.parse(body).choice;
  } catch (err) {
    return json_({ error: "bad request" });
  }
  if (CHOICES.indexOf(choice) === -1) return json_({ error: "bad request" });

  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    sheet_().appendRow([new Date(), choice]);
  } finally {
    lock.releaseLock();
  }
  return json_(tally_());
}
