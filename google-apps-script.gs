/**
 * SP Home Constructions - Contact Form to Google Sheet
 *
 * HOW TO DEPLOY:
 * 1. Create a Google Sheet at sheets.new
 * 2. Rename the first sheet to "Contact Submissions"
 * 3. Add headers in row 1: Timestamp, Name, Phone, Email, Service, Message
 * 4. Go to Extensions > Apps Script
 * 5. Paste this entire file and save
 * 6. Click Deploy > New Deployment
 * 7. Type: Web app, Execute as: Me, Access: Anyone
 * 8. Copy the webhook URL and paste it in js/script.js
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getSheetByName('Contact Submissions');

    ws.appendRow([
      new Date(),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.service || '',
      data.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('SP Home Constructions - Contact Form Webhook is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
