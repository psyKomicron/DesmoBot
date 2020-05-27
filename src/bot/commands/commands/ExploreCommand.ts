import { Message, MessageEmbed } from 'discord.js';
import { Command } from "../Command";
import { Bot } from "../../Bot";
import { CommandSyntaxError } from '../../errors/customs/CommandSyntaxError';
import { Explorer } from './explore/Explorer';
import { WikiExplorer } from './explore/WikiExplorer';
import { Printer } from '../../../console/Printer';
import { YTExplorer } from './explore/YTExplorer';
import { WrongArgumentError } from '../../errors/customs/WrongArgumentError';


export class ExploreCommand extends Command
{
    private keyword: string;
    private domainName: string;

    public constructor(message: Message, bot: Bot)
    {
        super("explore", message, bot);
        this.getParams(this.parseMessage());
    }

    public async execute(): Promise<void>
    {
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
        this.deleteMessage();
    }

    /**
     * Sends a message to the command message's channel
     * @param embed
     */
    public send(embed: MessageEmbed): Promise<Message>
    {
        return this.message.channel.send(embed);
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