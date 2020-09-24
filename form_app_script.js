var EMAIL_TEMPLATE_DOC_URL = 'https://docs.google.com/document/d/1_nuniOFYCWMkpqLmngG9Lwce9nSxBqZoXkmTYDVXrTI/edit?usp=sharing';
var EMAIL_SUBJECT = 'Howdy, here is the content you requested';

/**
 * Installs a trigger on the Spreadsheet for when a Form response is submitted.
 */
function installTrigger() {
  ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onFormSubmit()
      .create();
}


/**
 * Sends a customized email for every response on a form.
 * 
 * @param {Object} event - Form submit event
 */
function onFormSubmit(e) {
  var responses = e.namedValues;

  // If the question title is a label, it can be accessed as an object field.
  // If it has spaces or other characters, it can be accessed as a dictionary.
  var timestamp = responses.Timestamp[0];
  var email = responses['Email'][0].trim();
  var name = responses.Name[0].trim();
  var address = responses['Property address'][0].trim();
  var phoneOwner = responses["Owner's Phone number"][0].trim();
  var phoneYour = responses["Your phone number"][0].trim();
  var comments = responses["What? can we do for your"][0].trim();
  

      MailApp.sendEmail({
      to: email,
      cc: 'pioneerllc@hotmail.com',
      subject: address,
      htmlBody: createEmailBody(timestamp, email, name, address, phoneOwner, phoneYour, comments),
    });
  
  var status = 'Sent';

  // Append the status on the spreadsheet to the responses' row.
  var sheet = SpreadsheetApp.getActiveSheet();
  var row = sheet.getActiveRange().getRow();
  var column = e.values.length + 1;
  sheet.getRange(row, column).setValue(status);

  Logger.log("status=" + status + "; responses=" + JSON.stringify(responses));
}

/**
 * Creates email body and includes the links based on topic.
 *
 * @param {string} recipient - The recipient's email address.
 * @param {string[]} topics - List of topics to include in the email body.
 * @return {string} - The email body as an HTML string.
 */
function createEmailBody(timestamp, email, name, address, phoneOwner, phoneYour, comments) {
  
  // Make sure to update the emailTemplateDocId at the top.
  var docId = DocumentApp.openByUrl(EMAIL_TEMPLATE_DOC_URL).getId();
  var emailBody = docToHtml(docId);
  emailBody = emailBody.replace(/{{TIME}}/g, timestamp);
  emailBody = emailBody.replace(/{{EMAIL}}/g, email);
   emailBody = emailBody.replace(/{{NAME}}/g, name);
  emailBody = emailBody.replace(/{{ADDRESS}}/g, address);
  emailBody = emailBody.replace(/{{PHONE}}/g, phoneYour);
  emailBody = emailBody.replace(/{{COMMENTS}}/g, comments);

  return emailBody;
}

/**
 * Downloads a Google Doc as an HTML string.
 * 
 * @param {string} docId - The ID of a Google Doc to fetch content from.
 * @return {string} The Google Doc rendered as an HTML string.
 */
function docToHtml(docId) {

  // Downloads a Google Doc as an HTML string.
  var url = "https://docs.google.com/feeds/download/documents/export/Export?id=" +
            docId + "&exportFormat=html";
  var param = {
    method: "get",
    headers: {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
    muteHttpExceptions: true,
  };
  return UrlFetchApp.fetch(url, param).getContentText();
}