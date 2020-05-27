import fetch = require('node-fetch');
import { MessageEmbed } from 'discord.js';
import { ExploreCommand } from "../ExploreCommand";

export abstract class Explorer
{
    private _keyword: string;
    private command: ExploreCommand;

    public constructor(keyword: string, command: ExploreCommand)
    {
        this._keyword = keyword;
        this.command = command;
    }

    public urlize(url: string, keyword: string, spaceReplace: string): string
    {
        let keywordUrl = keyword.replace(/([ ])/g, spaceReplace);
        return url + keywordUrl;
    }

    protected get keyword(): string
    {
        return this._keyword;
    }

    protected set keyword(html)
    {
        this._keyword = html;
    }

    protected async getHTML(url: string): Promise<string>
    {
        let res = await fetch(url);
        let html = await res.text();
        return html;
    }

    protected send(embed: MessageEmbed): void
    {
        this.command.send(embed)
            .catch(e =>
            {
                if (e instanceof Error)
                    console.error(e.message.substr(0, 30) + "[...]");
            });
    }

    public abstract async explore(): Promise<void>;
}