import fs from 'fs/promises';
import config from '../config.js';

export async function saveSchedule(scheduleData) {
  try {
    const dataString = JSON.stringify(scheduleData, null, 2);
    await fs.writeFile(config.localSchedulePath, dataString, 'utf8');
  } catch (error) {
    console.error('Ошибка при сохранении расписания в локальный файл:', error);
    throw error;
  }
}

export async function loadSchedule() {
  try {
    const dataString = await fs.readFile(config.localSchedulePath, 'utf8');
    return JSON.parse(dataString);
  } catch (error) {
    console.error('Ошибка при чтении локального файла расписания:', error);
    throw error;
  }
}

export default { saveSchedule, loadSchedule };