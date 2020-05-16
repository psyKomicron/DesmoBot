import fs = require('fs');
import Discord = require('discord.js');
import readline = require('readline');
import { TokenReader } from './dal/Readers';
import { CommandFactory } from './commands/factory/CommandFactory';
import { clearInterval } from 'timers';
import { Printer } from '../console/Printer';
import { VoteLogger } from './commands/commands/vote/VoteLogger';

export class Bot 
{
    // own
    private prefix: string = "/";
    private readonly parents = ["psyKomicron#6527", "desmoclublyon#3056", "marquez#5719"];
    private readonly verbose: boolean = true;
    // discord
    private readonly _client: Discord.Client = new Discord.Client();

    public constructor(id: NodeJS.Timeout) 
    {
        this.init(id);
    }

    public get client(): Discord.Client
    {
        return this._client;
    }

    private init(id: NodeJS.Timeout): void
    {
        // initiate directories
        const directories = ["./files", "./files/downloads", "./files/logs"];
        for (var i = 0; i < directories.length; i++)
            if (!fs.existsSync(directories[i]))
                fs.mkdir(directories[i], () => { });
        // initiate bot
        this._client.on("ready", () =>
        {
            clearInterval(id);
            readline.moveCursor(process.stdout, -4, 0);
            process.stdout.write(`READY\n${Printer.error("-------------------------------------")}\n`);
        });
        this._client.on("message", (message) => { this.onMessage(message); });
        this._client.login(TokenReader.getToken());
    }

    private onMessage(message: Discord.Message): void 
    {
        let content = message.content;
        if (content.startsWith(this.prefix) && this.parents.includes(this.parseAuthor(message.author)))
        {
            console.log("\ncommand requested by : " + Printer.info(this.parseAuthor(message.author)));
            let substr = 0;
            let name = "";
            while (substr < content.length && content[substr] != "-" && content[substr] != " ")
            {
                name += content[substr];
                substr++;
            }
            try
            {
                if (name.substr(1) == "end")
                {
                    try
                    {
                        let index = content.split(" ")[1];
                        if (!Number.isNaN(Number.parseInt(index)))
                        {
                            VoteLogger.end(Number.parseInt(index));
                        }
                        if (message.deletable) message.delete();
                    }
                    catch (error) { }
                }
                else
                {
                    let command = CommandFactory.create(name.substr(1), message, this);
                    command.execute()
                        .catch(console.error);
                }
            } catch (error)
            {
                if (error instanceof Error)
                {
                    console.error(Printer.error(error.message));
                    if (this.verbose)
                        message.author.send(`It seems you have send a message with a content that I did not understand (most likely it contained spaces). Try again putting "" around arguments values.
Such as \`${this.prefix}chef -message "Bork! Bork! Bork!"\``);
                }
            }
        }
    }

    /**
     * Translate a Discord.User object into a string. Concatenate the username & discrimanator with a #
     * in between.
     * @param author Discord.User to translate
     */
    private parseAuthor(author: Discord.User): string
    {
        return author.username + "#" + author.discriminator;
    }
}

export enum FileType
{
    PDF = "pdf",
    IMG = "image",
    VIDEO = "video",
    CODE = "code",
    FILE = "all",
}