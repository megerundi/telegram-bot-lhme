// commands/help.js
export default (bot) => {
    bot.command('help', async (ctx) => {
        try {
            const helpMessage = `
Доступные команды:
/start - Запуск бота и приветствие
/help - Помощь по командам
/choice - Помочь в выбором
/fullschedule - Увидеть полное расписание автобуса
/scheduleview - Посмотреть расписание автобусов
/schedulesync - Синхронизировать расписание с Google Sheets
`;
            await ctx.reply(helpMessage);
        } catch (error) {
            console.error('Ошибка в команде /help:', error);
            await ctx.reply('Произошла ошибка при обработке команды /help.');
        }
    });
};