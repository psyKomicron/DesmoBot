import { Message } from 'discord.js';
import { Command } from '../Command';
import { Bot } from '../../Bot';
import { Printer } from '../../../console/Printer';

export class DefaultCommand extends Command
{
    public constructor(message: Message, bot: Bot)
    {
        super("default", message, bot);
    }
    
    public async execute(): Promise<void> 
    {
        console.log(Printer.title("default"));
        this.message.reply("unknown command !");
    }
}