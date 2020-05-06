import Discord = require('discord.js');
import { Command } from '../commands/Command';
import { DownloadCommand } from '../commands/DownloadCommand';
import { DeleteCommand } from '../commands/DeleteCommand';
import { HelpCommand } from '../commands/HelpCommand';
import { VoteCommand } from '../commands/VoteCommand';
import { EmbedCommand } from '../commands/EmbedCommand';
import { DefaultCommand } from '../commands/DefaultCommand';

export class CommandFactory
{
    public static create(type: string, message: Discord.Message): Command
    {
        let command: Command = undefined;
        switch (type)
        {
            case "download":
                command = new DownloadCommand(message);
                break;
            case "delete":
                command = new DeleteCommand(message);
                break;
            case "help":
                command = new HelpCommand(message);
                break;
            case "vote":
                command = new VoteCommand(message);
                break;
            case "embed":
                command = new EmbedCommand(message);
                break;
            default:
                command = new DefaultCommand(message);
                break;
        }
        return command;
    }
}