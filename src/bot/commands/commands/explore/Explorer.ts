import fetch = require('node-fetch');
import Discord = require('discord.js');
import { ExploreCommand } from "../ExploreCommand";

export abstract class Explorer
{
    private _url: string;
    private command: ExploreCommand;

    public constructor(url: string, command: ExploreCommand)
    {
        
        this._url = url;
        this.command = command;
    }

    protected get url(): string
    {
        return this._url;
    }

    protected set url(html)
    {
        this._url = html;
    }

    protected async getHTML(): Promise<string>
    {
        let res = await fetch(this.url);
        let html = await res.text();
        return html;
    }

    protected send(embed: Discord.MessageEmbed): void
    {
        this.command.send(embed);
    }

    public abstract async explore(): Promise<void>;
}