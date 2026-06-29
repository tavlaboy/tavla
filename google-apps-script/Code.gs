/**
 * Tavla reservation form handler
 *
 * SETUP:
 * 1. Open spreadsheet → Extensions → Apps Script → paste this file → Save
 * 2. Run doGet once → authorize Gmail + Sheets
 * 3. Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone)
 * 4. Copy /exec URL into index.html RESERVATION_SCRIPT_URL
 */

var RECIPIENT_EMAIL = 'tavlageo@gmail.com';
var SPREADSHEET_ID = '1xPo3LEgQrhVNeRaVY5fKLb9F1kCxrBApcUJBPHu34jo';
var SHEET_NAME = 'Reservations';
var RESTAURANT_PHONE = '+995 579 61 11 10';
var RESTAURANT_ADDRESS = '8 Guramishvili Ave, Tbilisi 0192';

var HEADERS = ['Timestamp', 'Date', 'Time', 'Guests', 'Name', 'Phone', 'Email', 'Notes', 'Language'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var err = validatePayload_(data);
    if (err) {
      return jsonResponse_({ ok: false, error: err });
    }

    var lang = normalizeLang_(data.lang);
    var sheet = getSheet_();
    var timestamp = new Date();

    sheet.appendRow([
      timestamp,
      data.date,
      data.time,
      data.guests,
      data.name,
      data.phone,
      data.email,
      data.notes,
      lang
    ]);

    var staffSubject = 'New reservation – ' + data.name + ' – ' + data.date + ' ' + data.time;
    var staffPlain = buildStaffPlain_(data, lang, timestamp);
    var staffHtml = buildStaffHtml_(data, lang, timestamp);

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: staffSubject,
      body: staffPlain,
      htmlBody: staffHtml,
      replyTo: data.email
    });

    var guestCopy = getGuestCopy_(lang);
    var guestPlain = buildGuestPlain_(data, lang, guestCopy);
    var guestHtml = buildGuestHtml_(data, lang, guestCopy);

    MailApp.sendEmail({
      to: data.email,
      subject: guestCopy.subject,
      body: guestPlain,
      htmlBody: guestHtml,
      replyTo: RECIPIENT_EMAIL
    });

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'Tavla reservation endpoint is running.' });
}

function validatePayload_(data) {
  if (!data) return 'Missing payload';
  var fields = ['date', 'time', 'guests', 'name', 'phone', 'email', 'notes'];
  for (var i = 0; i < fields.length; i++) {
    var key = fields[i];
    if (!data[key] || String(data[key]).trim() === '') {
      return 'Missing field: ' + key;
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
    return 'Invalid email';
  }
  return null;
}

function normalizeLang_(lang) {
  if (lang === 'en' || lang === 'ru') return lang;
  return 'ge';
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function getGuestCopy_(lang) {
  var copies = {
    ge: {
      subject: 'თავლა – თქვენი დაჯავშნის მოთხოვნა მიღებულია',
      title: 'გმადლობთ დაჯავშნისთვის',
      message: 'ჩვენი გუნდი მალე დაგიკავშირდებათ.',
      summaryTitle: 'თქვენი მოთხოვნა',
      help: 'საჭიროების შემთხვევაში დაგვიკავშირდით:',
      footer: 'თბილისი, საქართველო',
      labels: {
        date: 'თარიღი',
        time: 'დრო',
        guests: 'სტუმრები',
        name: 'სახელი',
        phone: 'ტელეფონი',
        email: 'ელფოსტა',
        notes: 'შენიშვნები'
      }
    },
    en: {
      subject: 'Tavla – Your reservation request was received',
      title: 'Thank you for your reservation',
      message: 'Our team will get back to you as soon as possible.',
      summaryTitle: 'Your request',
      help: 'If you need immediate assistance, please call:',
      footer: 'Tbilisi, Georgia',
      labels: {
        date: 'Date',
        time: 'Time',
        guests: 'Guests',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        notes: 'Notes'
      }
    },
    ru: {
      subject: 'Тавла – Ваш запрос на бронирование получен',
      title: 'Спасибо за бронирование',
      message: 'Наша команда свяжется с вами в ближайшее время.',
      summaryTitle: 'Ваш запрос',
      help: 'Если нужна срочная помощь, позвоните:',
      footer: 'Тбилиси, Грузия',
      labels: {
        date: 'Дата',
        time: 'Время',
        guests: 'Гости',
        name: 'Имя',
        phone: 'Телефон',
        email: 'Email',
        notes: 'Примечания'
      }
    }
  };
  return copies[lang] || copies.en;
}

function langDisplay_(lang) {
  if (lang === 'ge') return 'Georgian';
  if (lang === 'ru') return 'Russian';
  return 'English';
}

function escapeHtml_(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function emailShell_(title, bodyHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0e0c0a;font-family:Arial,Helvetica,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0c0a;padding:32px 16px;">' +
    '<tr><td align="center">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1a1410;border-top:3px solid #d8b46a;border-radius:4px;overflow:hidden;">' +
    '<tr><td style="padding:28px 32px 8px;text-align:center;">' +
    '<p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#f1e2c2;letter-spacing:.04em;">Tavla <span style="color:#d8b46a;">თავლა</span></p>' +
    '<p style="margin:8px 0 0;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(241,226,194,.45);">Georgian Restaurant · Tbilisi</p>' +
    '</td></tr>' +
    '<tr><td style="padding:8px 32px 28px;">' +
    '<h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:20px;font-weight:500;color:#f1e2c2;line-height:1.35;">' + escapeHtml_(title) + '</h1>' +
    bodyHtml +
    '</td></tr>' +
  '<tr><td style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,.08);text-align:center;">' +
    '<p style="margin:0 0 4px;font-size:12px;color:rgba(241,226,194,.4);">' + escapeHtml_(RESTAURANT_ADDRESS) + '</p>' +
    '<p style="margin:0;font-size:12px;color:#d8b46a;">' + escapeHtml_(RESTAURANT_PHONE) + '</p>' +
    '</td></tr></table></td></tr></table></body></html>';
}

function summaryTableHtml_(labels, data) {
  var rows = [
    [labels.date, data.date],
    [labels.time, data.time],
    [labels.guests, data.guests],
    [labels.name, data.name],
    [labels.phone, data.phone],
    [labels.email, data.email],
    [labels.notes, data.notes]
  ];
  var html = '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-collapse:collapse;">';
  for (var i = 0; i < rows.length; i++) {
    html += '<tr>' +
      '<td style="padding:10px 0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(241,226,194,.45);width:38%;vertical-align:top;border-bottom:1px solid rgba(255,255,255,.06);">' + escapeHtml_(rows[i][0]) + '</td>' +
      '<td style="padding:10px 0;font-size:14px;color:#f1e2c2;vertical-align:top;border-bottom:1px solid rgba(255,255,255,.06);">' + escapeHtml_(rows[i][1]) + '</td>' +
      '</tr>';
  }
  html += '</table>';
  return html;
}

function buildStaffPlain_(data, lang, timestamp) {
  return 'New reservation request\n\n' +
    'Date: ' + data.date + '\n' +
    'Time: ' + data.time + '\n' +
    'Guests: ' + data.guests + '\n' +
    'Name: ' + data.name + '\n' +
    'Phone: ' + data.phone + '\n' +
    'Email: ' + data.email + '\n' +
    'Notes: ' + data.notes + '\n' +
    'Language: ' + langDisplay_(lang) + '\n' +
    'Submitted: ' + timestamp;
}

function buildStaffHtml_(data, lang, timestamp) {
  var labels = {
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    notes: 'Notes'
  };
  var body =
    '<p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:rgba(241,226,194,.75);">A new table reservation was submitted via the website.</p>' +
    summaryTableHtml_(labels, data) +
    '<p style="margin:18px 0 0;font-size:12px;color:rgba(241,226,194,.4);">Language: ' + escapeHtml_(langDisplay_(lang)) + '<br>Submitted: ' + escapeHtml_(String(timestamp)) + '</p>';
  return emailShell_('New Reservation', body);
}

function buildGuestPlain_(data, lang, copy) {
  var L = copy.labels;
  return copy.title + '\n\n' + copy.message + '\n\n' +
    copy.summaryTitle + ':\n' +
    L.date + ': ' + data.date + '\n' +
    L.time + ': ' + data.time + '\n' +
    L.guests + ': ' + data.guests + '\n' +
    L.name + ': ' + data.name + '\n' +
    L.phone + ': ' + data.phone + '\n' +
    L.email + ': ' + data.email + '\n' +
    L.notes + ': ' + data.notes + '\n\n' +
    copy.help + ' ' + RESTAURANT_PHONE + '\n' +
    RESTAURANT_ADDRESS;
}

function buildGuestHtml_(data, lang, copy) {
  var body =
    '<p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:rgba(241,226,194,.75);">' + escapeHtml_(copy.message) + '</p>' +
    '<p style="margin:20px 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d8b46a;">' + escapeHtml_(copy.summaryTitle) + '</p>' +
    summaryTableHtml_(copy.labels, data) +
    '<p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:rgba(241,226,194,.55);">' + escapeHtml_(copy.help) + ' <a href="tel:+995579611110" style="color:#d8b46a;text-decoration:none;">' + escapeHtml_(RESTAURANT_PHONE) + '</a></p>';
  return emailShell_(copy.title, body);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
