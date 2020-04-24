import Discord = require('discord.js');
import readline = require('readline');
import { TokenReader } from './Readers';
import { Printer } from './Printer';
import { CommandFactory } from './commands/factory/CommandFactory';
import { clearInterval } from 'timers';

export class Bot 
{
    // own
    private prefix: string = "/";
    private readonly parents = ["psyKomicron#6527", "desmoclublyon#3056", "marquez#5719"];
    // discord
    private readonly client: Discord.Client = new Discord.Client();

    public constructor(id: NodeJS.Timeout) 
    {
        this.init(id);
    }

    public get Client(): Discord.Client
    {
        return this.client;
    }

    private init(id: NodeJS.Timeout): void
    {
        this.client.on("ready", () =>
        {
            clearInterval(id);
            readline.moveCursor(process.stdout, -4, 0);
            process.stdout.write(`READY\n${Printer.error("-------------------------------------")}\n`);
        });
        this.client.on("message", (message) => { this.onMessage(message); });
        this.client.login(TokenReader.getToken());
    }

    private onMessage(message: Discord.Message): void 
    {
        let content = message.content;
        if (!content.startsWith(this.prefix) || !this.parents.includes(this.parseAuthor(message.author))) return;
        console.log("\ncommand requested by : " + Printer.info(this.parseAuthor(message.author)));
        let args = content.split(/ /g);
        let command = CommandFactory.create(args[1], message);
        command.execute()
            .then(response =>
            {
                if (response == "error")
                {
                    console.error(
                        `error occured {
[-] command name  : ${command.Name}
[-] command values : ${command.Values.toString}`);
                }
            });
    }

    /**
     * Translate a Discord.User object into a string.
     * concatenate the username & discrimanator with a #
     * in between.
     * @param author Discord.User to translate
     */
    private parseAuthor(author: Discord.User): string
    {
        let username = author.username;
        let discriminator = author.discriminator;
        return username + "#" + discriminator;
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