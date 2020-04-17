import Discord = require('discord.js');
import { TokenReader, EmojiReader } from './Readers';
import { Printer } from './Printer';
import { DownloadCommand } from './commands/DownloadCommand';
import { DeleteCommand } from './commands/DeleteCommand';
import { CommandFactory } from './commands/factory/CommandFactory';

export class Bot 
{
    // own
    private workingChannel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;
    private prefix: string = "/";
    private readonly parents = ["psyKomicron#6527", "desmoclublyon#3056", "marquez#5719"];
    // discord
    private client: Discord.Client = new Discord.Client();
    // external
    private emojiReader: EmojiReader = new EmojiReader();

    public constructor() 
    {
        this.init();
    }

    private init(): void
    {
        this.client.on("ready", () => { console.log(Printer.info("--------------------------------------------") + "\n\t\tREADY"); });
        this.client.on("message", (message) => { this.onMessage(message); });
        this.client.login(TokenReader.getToken());
    }

    private onMessage(message: Discord.Message): void 
    {
        let content = message.content;
        let channel = message.channel;
        if (!content.startsWith(this.prefix) || !this.parents.includes(this.parseAuthor(message.author))) return;
        console.log("\ncommand requested by : " + Printer.info(this.parseAuthor(message.author)) + "\n");
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
                if (response == "executed")
                {
                    console.log(`command ${command.Name} executed`);
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