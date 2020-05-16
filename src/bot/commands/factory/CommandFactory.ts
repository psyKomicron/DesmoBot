import Discord = require('discord.js');
import { Command } from '../Command';
import { DownloadCommand } from '../commands/DownloadCommand';
import { DeleteCommand } from '../commands/DeleteCommand';
import { HelpCommand } from '../commands/HelpCommand';
import { VoteCommand } from '../commands/vote/VoteCommand';
import { EmbedCommand } from '../commands/EmbedCommand';
import { DefaultCommand } from '../commands/DefaultCommand';
import { TestCommand } from '../commands/TestCommand';
import { ReplyCommand } from '../commands/ReplyCommand';
import { Bot } from '../../Bot';

export class CommandFactory
{
    public static create(type: string, message: Discord.Message, bot: Bot): Command
    {
        let command: Command = undefined;
        switch (type)
        {
            case "download":
                command = new DownloadCommand(message, bot);
                break;
            case "delete":
                command = new DeleteCommand(message, bot);
                break;
            case "help":
                command = new HelpCommand(message, bot);
                break;
            case "vote":
                command = new VoteCommand(message, bot);
                break;
            case "embed":
                command = new EmbedCommand(message, bot);
                break;
            case "r":
                command = new ReplyCommand(message, bot);
                break;
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