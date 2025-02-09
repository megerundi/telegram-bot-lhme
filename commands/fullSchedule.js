// commands/fullSchedule.js
import localScheduleService from '../services/localScheduleService.js';
import { getDayKey, formatTimesList } from '../utils/helpers.js';

export default (bot) => {
  // При вызове команды /fullSchedule отправляем сообщение с выбором автобуса
  bot.command('fullschedule', async (ctx) => {
    try {
      const scheduleData = await localScheduleService.loadSchedule();
      const buses = Object.keys(scheduleData);
      if (!buses || buses.length === 0) {
        await ctx.reply('Расписание не найдено. Сначала выполните команду /scheduleSync.');
        return;
      }
      // Формируем inline-клавиатуру: по одной кнопке для каждого автобуса
      const inlineKeyboard = buses.map(bus => ([{ text: bus, callback_data: `selectBus_${bus}` }]));
      const keyboard = { inline_keyboard: inlineKeyboard };
      await ctx.reply('Выберите автобус:', { reply_markup: keyboard });
    } catch (error) {
      console.error('Ошибка в команде /fullSchedule:', error);
      await ctx.reply('Произошла ошибка при получении расписания.');
    }
  });

  // Обработчик выбора автобуса
  bot.action(/selectBus_(.+)/, async (ctx) => {
    try {
      const bus = ctx.match[1]; // Извлекаем название автобуса из callback_data
      const scheduleData = await localScheduleService.loadSchedule();
      const dayKey = getDayKey(); // Определяет текущий день: "weekdays", "saturday" или "sunday"
      if (!scheduleData[bus]) {
        await ctx.answerCbQuery('Автобус не найден.');
        return;
      }
      const busSchedule = scheduleData[bus][dayKey];
      // По умолчанию показываем расписание из Пункта A
      const timesA = busSchedule.departuresA;
      const formattedTimes = formatTimesList(timesA);
      // Формируем сообщение: номер автобуса жирным, затем пустая строка, затем форматированный список рейсов
      const msg = `<b>${bus}</b>\n\n${formattedTimes}`;
      // Формируем клавиатуру:
      // Кнопка переключения (т.е. "Показать расписание из пункта B") и кнопка "Назад"
      const keyboard = {
        inline_keyboard: [
          [{ text: 'Показать расписание из Афипской', callback_data: `toggle_full_${bus}_A` }],
          [{ text: 'Назад', callback_data: 'back_full' }]
        ]
      };
      await ctx.answerCbQuery();
      await ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: keyboard });
    } catch (error) {
      console.error('Ошибка при выборе автобуса:', error);
      await ctx.reply('Произошла ошибка при обработке выбора автобуса.');
    }
  });

  // Обработчик переключения между расписаниями из пунктов A и B
  // Callback data имеет формат: "toggle_full_{bus}_{currentDisplayed}"
  bot.action(/toggle_full_(.+)_(A|B)/, async (ctx) => {
    try {
      const bus = ctx.match[1];
      const currentDisplayed = ctx.match[2]; // Текущее отображаемое расписание: "A" или "B"
      const scheduleData = await localScheduleService.loadSchedule();
      const dayKey = getDayKey();
      if (!scheduleData[bus]) {
        await ctx.answerCbQuery('Автобус не найден.');
        return;
      }
      const busSchedule = scheduleData[bus][dayKey];
      let times, newDisplayed, toggleButtonText;
      if (currentDisplayed === 'A') {
        // Если сейчас отображается расписание из пункта A, переключаемся на пункт B
        times = busSchedule.departuresB;
        newDisplayed = 'B';
        toggleButtonText = 'Показать расписание из Краснодара';
      } else {
        // Если сейчас отображается расписание из пункта B, переключаемся на пункт A
        times = busSchedule.departuresA;
        newDisplayed = 'A';
        toggleButtonText = 'Показать расписание из Афипской';
      }
      const formattedTimes = formatTimesList(times);
      const msg = `<b>${bus}</b>\n${formattedTimes}`;
      const keyboard = {
        inline_keyboard: [
          [{ text: toggleButtonText, callback_data: `toggle_full_${bus}_${newDisplayed}` }],
          [{ text: 'Назад', callback_data: 'back_full' }]
        ]
      };
      await ctx.answerCbQuery();
      await ctx.editMessageText(msg, { parse_mode: 'HTML', reply_markup: keyboard });
    } catch (error) {
      console.error('Ошибка при переключении расписания:', error);
      await ctx.reply('Произошла ошибка при переключении расписания.');
    }
  });

  // Обработчик кнопки "Назад" — возвращает пользователя к выбору автобуса
  bot.action('back_full', async (ctx) => {
    try {
      const scheduleData = await localScheduleService.loadSchedule();
      const buses = Object.keys(scheduleData);
      if (!buses || buses.length === 0) {
        await ctx.answerCbQuery('Расписание не найдено.');
        return;
      }
      const inlineKeyboard = buses.map(bus => ([{ text: bus, callback_data: `selectBus_${bus}` }]));
      const keyboard = { inline_keyboard: inlineKeyboard };
      await ctx.answerCbQuery();
      await ctx.editMessageText('Выберите автобус:', { reply_markup: keyboard });
    } catch (error) {
      console.error('Ошибка при возврате к выбору автобуса:', error);
      await ctx.reply('Произошла ошибка при возврате к выбору автобуса.');
    }
  });
};