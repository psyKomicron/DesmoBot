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
import { ExploreCommand } from '../commands/ExploreCommand';
import { PlayCommand } from '../commands/PlayCommand';

export class CommandFactory
{
    public static create(type: string, bot: Bot): Command
    {
        let command: Command = undefined;
        switch (type)
        {
            case "dl":
            case "download":
                command = new DownloadCommand(bot);
                break;
            case "d":
            case "delete":
                command = new DeleteCommand(bot);
                break;
            case "embed":
                command = new EmbedCommand(bot);
                break;
            case "e":
            case "explore":
                command = new ExploreCommand(bot);
                break;
            case "p":
            case "play":
                command = new PlayCommand(bot);
                break;
            case "h":
            case "help":
                command = new HelpCommand(bot);
                break;
            case "r":
            case "reply":
                command = new ReplyCommand(bot);
                break;
            case "t":
            case "test":
                command = new TestCommand(bot);
                break;
            case "v":
            case "vote":
                command = new VoteCommand(bot);
                break;
            default:
                command = new DefaultCommand(bot);
                break;
        }
        return command;
    }
}