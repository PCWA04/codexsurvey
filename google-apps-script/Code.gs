const SHEET_NAME = 'Responses';

const HEADERS = [
  'SubmittedAt',
  'Name',
  'Q1_UnderstandCodex',
  'Q2_ValueForManagers',
  'Q3_CanBuildPrototype',
  'Q4_EaseOfUse',
  'Q5_CourseStructure',
  'Q6_InstructorClarity',
  'Q7_MostValuablePractice',
  'Q8_UseCases',
  'Q9_AdoptionIntent',
  'Q10_RecommendScore',
  'UserAgent',
];

function doGet() {
  return jsonResponse({ ok: true, message: 'Vibe Coding Feedback endpoint is ready.' });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const sheet = getResponseSheet_();
    const row = HEADERS.map((header) => payload[header] ?? '');
    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function getResponseSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = firstRow.some((cell) => cell !== '');

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
