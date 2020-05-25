
import Discord = require('discord.js');
import { Command } from "../Command";
import { Bot } from "../../Bot";
import { CommandSyntaxException } from '../../exceptions/customs/CommandSyntaxException';
import { Explorer } from './explore/Explorer';
import { WikiExplorer } from './explore/WikiExplorer';
import { Printer } from '../../../console/Printer';


export class ExploreCommand extends Command
{
    private keyword: string;
    private domain: string;
    private domainName: string;

    public constructor(message: Discord.Message, bot: Bot)
    {
        super("explore", message, bot);
        this.getParams(this.parseMessage());
    }

    public async execute(): Promise<void>
    {
        const url = this.urlize(`${this.domain}${this.keyword}`);
        console.log(Printer.args(["keyword", "domain", "url"], [`${this.keyword}`, `${this.domain}`, `${url}`]));
        let e: Explorer;
        switch (this.domainName)
        {
            case "github":
                break;
            case "wikipedia":
                e = new WikiExplorer(url, this);
                break;
        }
        e.explore();
        this.deleteMessage();
    }

    public send(embed: Discord.MessageEmbed): Promise<Discord.Message>
    {
        embed.setAuthor(this.bot.client.user.username);
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
                case "g":
                case "git":
                    this.domain = `https://api.github.com/users/`;
                    this.domainName = "github";
                    break;
                case "w":
                case "wiki":
                    this.domain = `https://en.wikipedia.org/wiki/`;
                    this.domainName = "wikipedia";
                    break;
                default:
                    throw new CommandSyntaxException(this);
            }
        });
    }

    private urlize(url: string): string
    {
        return url.replace(/([ ])/g, "_");
    }
}