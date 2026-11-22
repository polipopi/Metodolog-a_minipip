const SHEET_NAME = "Respuestas Mini-IPIP";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const scoreNames = [
      "Extraversión",
      "Amabilidad",
      "Responsabilidad",
      "Neuroticismo",
      "Intelecto / Imaginación"
    ];
    const headers = [
      "Fecha de registro","Código participante","Nombre completo",
      "Correo institucional","Carrera","Estado de ánimo",
      ...Array.from({length:20},(_,i)=>"Pregunta "+(i+1)),
      ...scoreNames
    ];
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
    const row = [
      new Date(), data.participantCode, data.fullName, data.email,
      data.career, data.mood,
      ...Array.from({length:20},(_,i)=>data.answers[String(i+1)] ?? ""),
      ...scoreNames.map(name=>data.scores[name] ?? "")
    ];
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(error)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Configura SPREADSHEET_ID en las propiedades del proyecto.");
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}