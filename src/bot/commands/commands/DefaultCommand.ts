import Discord = require('discord.js');
import { Command } from '../Command';
import { Bot } from '../../Bot';

export class DefaultCommand extends Command
{
    public constructor(message: Discord.Message, bot: Bot)
    {
        super("default", message, bot);
    }
    
    public async execute(): Promise<void> 
    {
        this.message.reply("unknown command !");
    }
}