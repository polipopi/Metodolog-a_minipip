const SHEET_NAME = "Respuestas Mini-IPIP";

function doGet(e) {
  const callback = String(e.parameter.callback || "");
  const email = normalizeEmail_(e.parameter.email || "");
  let response;
  try {
    if (e.parameter.action !== "checkEmail" || !/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      throw new Error("Solicitud no válida.");
    }
    if (!/^[A-Z0-9._%+-]+@espol\.edu\.ec$/i.test(email)) {
      throw new Error("Correo institucional no válido.");
    }
    response = {ok:true, exists:emailExists_(getSheet_(), email)};
  } catch (error) {
    response = {ok:false, error:String(error)};
  }
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(response) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse(e.postData.contents);
    const email = normalizeEmail_(data.email || "");
    if (!/^[A-Z0-9._%+-]+@espol\.edu\.ec$/i.test(email)) {
      throw new Error("Correo institucional no válido.");
    }

    lock.waitLock(10000);
    const sheet = getSheet_();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha de registro","Código participante","Nombre completo",
        "Correo institucional","Carrera","Estado de ánimo",
        ...Array.from({length:20},(_,i)=>"Pregunta "+(i+1)),
        "Extraversión","Amabilidad","Responsabilidad","Neuroticismo","Intelecto / Imaginación"
      ]);
    }
    if (emailExists_(sheet, email)) {
      throw new Error("Este correo institucional ya fue registrado.");
    }

    const scoreNames = [
      "Extraversión",
      "Amabilidad",
      "Responsabilidad",
      "Neuroticismo",
      "Intelecto / Imaginación"
    ];
    const row = [
      new Date(), data.participantCode, data.fullName, email,
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
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function emailExists_(sheet, email) {
  if (sheet.getLastRow() < 2) return false;
  const values = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getValues();
  return values.some(row => normalizeEmail_(row[0]) === email);
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
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