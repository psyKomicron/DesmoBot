import { Bot } from "../../Bot";
import { Printer } from '../../../console/Printer';
import { Command } from "../Command";
import { Explorer } from './explore/Explorer';
import { YTExplorer } from './explore/YTExplorer';
import { WikiExplorer } from './explore/WikiExplorer';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { CommandSyntaxError } from '../../errors/exec_errors/CommandSyntaxError';
import { WrongArgumentError } from '../../errors/exec_errors/WrongArgumentError';


export class ExploreCommand extends Command
{
    private channel: TextChannel;
    private keyword: string;
    private domainName: string;

    public constructor(bot: Bot)
    {
        super("explore", bot);
    }

    public async execute(message: Message): Promise<void>
    {
        this.channel = message.channel instanceof TextChannel ? message.channel : undefined;
        this.getParams(this.parseMessage(message));
        console.log(Printer.title("explorer"));
        console.log(Printer.args(["keyword", "domain name"], [`${this.keyword}`, `${this.domainName}`]));
        let e: Explorer;
        switch (this.domainName)
        {
            case "youtube":
                e = new YTExplorer(this.keyword, this);
                break;
            case "wikipedia":
                e = new WikiExplorer(this.keyword, this);
                break;
            default:
                throw new WrongArgumentError(this);
        }
        e?.explore();
        this.deleteMessage(message, 1000);
    }

    /**
     * Sends a message to the command message's channel
     * @param embed
     */
    public send(embed: MessageEmbed): Promise<Message>
    {
        return this.channel.send(embed);
    }

    private getParams(args: Map<string, string>): void
    {
        args.forEach((v, k) =>
        {
            switch (k)
            {
                case "k":
                case "keyword":
                    this.keyword = v;
                    break;
                case "yt":
                case "youtube":
                    this.domainName = "youtube";
                    break;
                case "w":
                case "wiki":
                    this.domainName = "wikipedia";
                    break;
                default:
                    throw new CommandSyntaxError(this);
            }
        });
    }
}