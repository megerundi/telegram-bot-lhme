export default (bot) => {
    bot.command('start', async (ctx) => {
        try {
            await ctx.reply('Бобра пожаловать!');
        } catch (error) {
            console.error('Ошибка в команде /start:', error);
            await ctx.reply('Произошла ошибка при обработке команды /start. Попробуйте повторить позже.');
        }
    });
};