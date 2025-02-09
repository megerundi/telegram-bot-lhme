import { google } from 'googleapis';
import config from '../config.js';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const auth = new google.auth.GoogleAuth({
  keyFile: config.googleCredentialsPath,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

async function getScheduleData() {
  try {
    const spreadsheetId = config.spreadsheetId;

    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });
    const sheetsList = spreadsheetResponse.data.sheets;
    if (!sheetsList || sheetsList.length === 0) {
      throw new Error('Нет листов в таблице');
    }

    const parseRange = (rangeData) => {
      const values = rangeData.values || [];
      const departuresA = [];
      const departuresB = [];
      values.forEach((row) => {
        if (row[0]) departuresA.push(row[0]);
        if (row[1]) departuresB.push(row[1]);
      });
      return { departuresA, departuresB };
    };

    // Объект, куда будут собраны данные для каждого автобуса (каждого листа)
    const scheduleData = {};

    // Для каждого листа (каждый соответствует расписанию одного автобуса)
    await Promise.all(
      sheetsList.map(async (sheetInfo) => {
        const sheetTitle = sheetInfo.properties.title;
        const ranges = [
          `${sheetTitle}!A3:B50`, // Будние дни
          `${sheetTitle}!D3:E50`, // Суббота
          `${sheetTitle}!G3:H50`, // Воскресенье
        ];

        // Запрашиваем все три диапазона для текущего листа
        const response = await sheets.spreadsheets.values.batchGet({
          spreadsheetId,
          ranges,
        });

        const valueRanges = response.data.valueRanges;
        let weekdaysRange, saturdayRange, sundayRange;
        // Определяем, какой диапазон соответствует каким дням
        valueRanges.forEach((rangeData) => {
          const range = rangeData.range; // Например: "Bus 1!A2:B"
          if (range.includes('!A')) {
            weekdaysRange = rangeData;
          } else if (range.includes('!D')) {
            saturdayRange = rangeData;
          } else if (range.includes('!G')) {
            sundayRange = rangeData;
          }
        });

        // Если какого-либо диапазона нет, подставляем пустой массив
        if (!weekdaysRange) weekdaysRange = { values: [] };
        if (!saturdayRange) saturdayRange = { values: [] };
        if (!sundayRange) sundayRange = { values: [] };

        scheduleData[sheetTitle] = {
          weekdays: parseRange(weekdaysRange),
          saturday: parseRange(saturdayRange),
          sunday: parseRange(sundayRange),
        };
      })
    );

    return scheduleData;
  } catch (error) {
    console.error('Ошибка при получении данных расписания из Google Sheets:', error);
    throw error;
  }
}

export default { getScheduleData };