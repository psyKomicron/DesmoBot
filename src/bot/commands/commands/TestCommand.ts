import Discord = require('discord.js');
import { Command } from "../Command";
import { Bot } from '../../Bot';

export class TestCommand extends Command
{
    public constructor(message: Discord.Message, bot: Bot)
    {
        super("Test command", message, bot);
    }

    public async execute(): Promise<void>
    {
        let args = this.parseMessage();
        args.forEach((v, k) =>
        {
            console.log(`{"${k}": "${v}"}`);
        });
    }

}