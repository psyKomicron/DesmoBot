import Discord = require('discord.js');
import { Command } from "../Command";
import { DownloadCommand } from '../DownloadCommand';
import { DeleteCommand } from '../DeleteCommand';
import { DefaultCommand } from '../DefaultCommand';
import { HelpCommand } from './HelpCommand';
import { VoteCommand } from '../VoteCommand';
import { Bot } from '../../Bot';

export class CommandFactory
{
    public static create(type: string, message: Discord.Message): Command
    {
        let command: Command = undefined;
        //console.log(type);
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
            default:
                command = new DefaultCommand(message);
                break;
        }
        return command;
    }
}