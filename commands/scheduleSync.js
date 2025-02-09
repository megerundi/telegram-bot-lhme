import googleSheetsService from '../services/googleSheetsService.js';
import localScheduleService from '../services/localScheduleService.js';

export default (bot) => {
  bot.command('schedulesync', async (ctx) => {
    try {
      const scheduleData = await googleSheetsService.getScheduleData();
      // Сохраняем данные в локальный JSON-файл
      await localScheduleService.saveSchedule(scheduleData);
      await ctx.reply('Расписание успешно синхронизировано с Google Sheets.');
    } catch (error) {
      console.error('Ошибка в команде /scheduleSync:', error);
      await ctx.reply('Произошла ошибка при синхронизации расписания.');
    }
  });
};