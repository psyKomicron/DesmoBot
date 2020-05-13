import Discord = require('discord.js');
import { Command } from "../Command";

export class TestCommand extends Command
{
    public constructor(message: Discord.Message)
    {
        super("Test command", message);
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