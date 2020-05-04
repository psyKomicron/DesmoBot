import Discord = require('discord.js');
import { Command } from './Command';

export class DefaultCommand extends Command
{
    public constructor(message: Discord.Message)
    {
        super("default", message);
    }
    
    public async execute(): Promise<Object> 
    {
        this.message.reply("unknown command !");
        return "executed";
    }
}