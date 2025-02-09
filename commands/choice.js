export default (bot) => {
    bot.command('choice', async (ctx) => {
        try {
            ctx.scene.enter('choice');
        } catch (error) {
            console.error('Ошибка в команде /start:', error);
            await ctx.reply('Произошла ошибка при обработке команды /start. Попробуйте повторить позже.');
        }
    });
};