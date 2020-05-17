import Discord = require('discord.js');
import { Bot } from '../../Bot';
import { Command } from '../Command';
import { DownloadCommand } from '../commands/DownloadCommand';
import { DeleteCommand } from '../commands/DeleteCommand';
import { HelpCommand } from '../commands/HelpCommand';
import { VoteCommand } from '../commands/VoteCommand';
import { EmbedCommand } from '../commands/EmbedCommand';
import { DefaultCommand } from '../commands/DefaultCommand';
import { TestCommand } from '../commands/TestCommand';
import { ReplyCommand } from '../commands/ReplyCommand';

export class CommandFactory
{
    public static create(type: string, message: Discord.Message, bot: Bot): Command
    {
        let command: Command = undefined;
        switch (type)
        {
            case "dl":
            case "download":
                command = new DownloadCommand(message, bot);
                break;
            case "d":
            case "delete":
                command = new DeleteCommand(message, bot);
                break;
            case "h":
            case "help":
                command = new HelpCommand(message, bot);
                break;
            case "v":
            case "vote":
                command = new VoteCommand(message, bot);
                break;
            case "embed":
                command = new EmbedCommand(message, bot);
                break;
            case "r":
            case "reply":
                command = new ReplyCommand(message, bot);
                break;
            case "t":
            case "test":
                command = new TestCommand(message, bot);
                break;
            default:
                command = new DefaultCommand(message, bot);
                break;
        }
        return command;
    }
}