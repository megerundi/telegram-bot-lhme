import { Telegraf, Scenes, session } from 'telegraf';
import { message } from 'telegraf/filters';
import config from './config.js';

import startCommand from './commands/start.js';
import helpCommand from './commands/help.js';
import choice from './commands/choice.js';
import fullSchedule from './commands/fullSchedule.js';
import scheduleViewCommand from './commands/scheduleView.js';
import scheduleSyncCommand from './commands/scheduleSync.js';

import choiceScene from './scenes/choice.js';

const bot = new Telegraf(config.botToken);
const stage = new Scenes.Stage([choiceScene]);

bot.telegram.setMyCommands([
  { command: "start", description: "Запустить бота" },
  { command: "help", description: "Получить справку по боту" },
  { command: "choice", description: "Помочь с выбором" },
  { command: "fullschedule", description: "Полное расписание" },
  { command: "scheduleview", description: "Ближайший автобус" },
  { command: "schedulesync", description: "Обновить расписание" },
]);

bot.command("myid", async (ctx) => {
  ctx.reply(`${ctx.from.id}`);
})

bot.use(session());
bot.use(stage.middleware());
bot.use((ctx, next) => {
  if (!ctx.from) return next();
  const userId = String(ctx.from.id);

  if (!config.authorizedIds.includes(userId)) {
    return ctx.reply('Извините, у вас нет доступа к данному боту.');
  }
  return next();
});

bot.catch(async (err, ctx) => {
  console.error(`Ошибка в обновлении ${ctx.updateType}:`, err);
  await ctx.reply('Произошла ошибка. Попробуйте повторить запрос позже.');
});


startCommand(bot);
helpCommand(bot);
choice(bot);
fullSchedule(bot);
scheduleViewCommand(bot);
scheduleSyncCommand(bot);

bot.on(message('text'), async (ctx) => {
  await ctx.reply('Неизвестная команда. Используйте /help для получения списка доступных команд.');
});

try {
  bot.launch();
  console.log('Bot is running...')
} catch (err){
  console.error('An error occured', err);
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));