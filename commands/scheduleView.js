// commands/scheduleView.js
import localScheduleService from '../services/localScheduleService.js';
import { filterTimes, getDayKey, formatTimesList } from '../utils/helpers.js';

export default (bot) => {
  // Первый этап: отправляем сообщение с выбором пункта отправления
  bot.command('scheduleview', async (ctx) => {
    try {
      await ctx.reply('Выберите пункт отправления:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Из Краснодара', callback_data: 'departure_A' }],
            [{ text: 'Из Афипской', callback_data: 'departure_B' }]
          ]
        }
      });
    } catch (error) {
      console.error('Ошибка в команде /scheduleView:', error);
      await ctx.reply('Произошла ошибка при запросе расписания.');
    }
  });

  // Обработка callback-запросов
  bot.on('callback_query', async (ctx) => {
    try {
      const data = ctx.callbackQuery.data;

      // 1. Выбор пункта отправления
      if (data.startsWith('departure_')) {
        const departure = data.split('_')[1]; // "A" или "B"
        await ctx.answerCbQuery();
        await ctx.editMessageText(
          `Вы выбрали пункт ${departure == "A" ? "Краснодар" : "Афипский"}. Теперь выберите временной интервал:`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Ближайший 1 час', callback_data: `filter_1_${departure}` }],
                [{ text: 'Ближайшие 2 часа', callback_data: `filter_2_${departure}` }],
                [{ text: 'Ближайшие 4 часа', callback_data: `filter_4_${departure}` }]
              ]
            }
          }
        );
      }
      // 2. Выбор временного интервала и вывод финального расписания
      else if (data.startsWith('filter_')) {
        // Формат callback_data: "filter_{filterHours}_{departure}", например, "filter_1_A"
        const parts = data.split('_'); // ["filter", "1", "A"]
        const filterHours = Number(parts[1]);
        const departure = parts[2];
        const scheduleData = await localScheduleService.loadSchedule();
        const dayKey = getDayKey(); // "weekdays", "saturday" или "sunday"

        let replyMsg = `<b>Расписание автобусов (${dayKey === 'weekdays' ? 'Будние дни' : dayKey === 'saturday' ? 'Суббота' : 'Воскресенье'}) на ближайшие ${filterHours} час(ов) для пункта ${departure == "A" ? "Краснодар" : "Афипский"}:</b>\n\n`;
        for (const bus in scheduleData) {
          if (Object.prototype.hasOwnProperty.call(scheduleData, bus)) {
            const busSchedule = scheduleData[bus][dayKey];
            const times = busSchedule[`departures${departure}`];
            const filtered = filterTimes(times, filterHours);
            // Добавляем номер автобуса жирным, затем отступ (пустая строка)
            replyMsg += `<b>${bus}</b>\n`;
            // Форматируем временные точки с использованием форматирования (максимум 5 в строке, моноширинный)
            replyMsg += formatTimesList(filtered);
            replyMsg += `\n\n`;
          }
        }

        await ctx.answerCbQuery();
        // Добавляем inline-кнопку "Назад" для возврата к выбору временного интервала
        await ctx.editMessageText(replyMsg, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Назад', callback_data: `back_filter_${departure}` }]
            ]
          }
        });
      }
      // 3. Обработка кнопки "Назад" — возвращаем пользователя к выбору временного интервала
      else if (data.startsWith('back_filter_')) {
        const departure = data.split('_')[2]; // "A" или "B"
        await ctx.answerCbQuery();
        await ctx.editMessageText(
          `Вы выбрали пункт ${departure == "A" ? "Краснодар" : "Афипский"}. Теперь выберите временной интервал:`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Ближайший 1 час', callback_data: `filter_1_${departure}` }],
                [{ text: 'Ближайшие 2 часа', callback_data: `filter_2_${departure}` }],
                [{ text: 'Ближайшие 4 часа', callback_data: `filter_4_${departure}` }]
              ]
            }
          }
        );
      }
    } catch (error) {
      console.error('Ошибка при обработке callback_query в scheduleView:', error);
      await ctx.reply('Произошла ошибка при обработке вашего выбора.');
    }
  });
};