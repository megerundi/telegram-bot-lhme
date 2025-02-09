import dotenv from 'dotenv';
dotenv.config();

const parseAuthorizedIds = (idsString) => {
  if (!idsString) return [];
  return idsString.split(',').map(id => id.trim());
};

const config = {
  botToken: process.env.BOT_TOKEN,
  googleCredentialsPath: process.env.GOOGLE_CREDENTIALS_PATH,
  authorizedIds: parseAuthorizedIds(process.env.AUTHORIZED_IDS),
  localSchedulePath: process.env.LOCAL_SCHEDULE_PATH || './data/schedule.json',
  spreadsheetId: process.env.SPREADSHEET_ID,
};

export default config;