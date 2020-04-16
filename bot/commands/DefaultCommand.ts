import Discord = require('discord.js');
import { Command } from './Command';

export class DefaultCommand extends Command
{
    private message: Discord.Message;

    public constructor(message: Discord.Message)
    {
        super("default", [`${message.content}`, `${message.channel}`]);
        this.message = message;
    }
    
    public async execute(): Promise<Object> 
    {
        this.message.reply("unknown command !");
        return "executed";
    }
}