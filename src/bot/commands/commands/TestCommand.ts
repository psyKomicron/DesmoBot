import { Bot } from '../../Bot';
import { Command } from "../Command";
import { Message } from 'discord.js';

export class TestCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("Test command", bot);
    }

    public async execute(message: Message): Promise<void>
    {
        let args = this.parseMessage(message);
        args.forEach((v, k) =>
        {
            console.log(`{"${k}": "${v}"}`);
        });
    }

}