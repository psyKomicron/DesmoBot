import { Bot } from '../../Bot';
import { Message } from 'discord.js';
import { Command } from '../Command';
import { Printer } from '../../../console/Printer';

export class DefaultCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("default", bot);
    }
    
    public async execute(message: Message): Promise<void> 
    {
        console.log(Printer.title("default"));
        message.reply("unknown command !");
    }
}