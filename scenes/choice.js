import { Scenes, Markup} from 'telegraf';
import { message } from 'telegraf/filters';
import { randomizer } from '../utils/helpers.js';

const choiceScene = new Scenes.BaseScene('choice');
const options = [];

choiceScene.enter(async ctx => await ctx.reply('Отправьте варианты отдельными сообщениями', 
    Markup.keyboard(["/exit", "/choice"]).resize())
)
choiceScene.leave(async ctx => await ctx.reply(`🫰`, 
    Markup.removeKeyboard())
);

choiceScene.command('exit', async ctx => {
    await ctx.scene.leave();
})

choiceScene.command('choice', async ctx => {
    if(options.length < 2) {
        await ctx.reply('Введите как минимум 2 варианта');
        return;
    }
    const index = randomizer(options.length);
    ctx.reply(`Полагаю надо выбрать вариант: ${options[index]}`);
    await ctx.scene.leave();
})

choiceScene.on(message('text'), ctx => {
    options.push(ctx.message.text);
});

export default choiceScene;