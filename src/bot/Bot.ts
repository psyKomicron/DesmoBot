import { Client, Message } from 'discord.js';
import readline = require('readline');
import { clearInterval } from 'timers';
import { Logger } from './commands/logger/Logger';
import { Printer } from '../console/Printer';
import { CustomError } from './errors/CustomError';
import { CommandFactory } from './commands/factory/CommandFactory';
import { TokenReader, FileSystem as fs, EmojiReader } from './dal/Readers';
import { DefaultLogger } from './commands/logger/loggers/DefaultLogger';

export class Bot 
{
    // own
    private _logger: Logger = new DefaultLogger();
    private prefix: string = "/";
    private readonly parents = ["psyKomicron#6527", "desmoclublyon#3056", "marquez#5719", "Onyxt#9305"];
    private readonly verbose: boolean = true;
    // discord
    private readonly _client: Client = new Client();

    public constructor(id: NodeJS.Timeout) 
    {
        this.init(id);
    }

    public get client(): Client
    {
        return this._client;
    }

    public get logger(): Logger { return this._logger; }

    private init(id: NodeJS.Timeout): void
    {
        // initiate directories
        const directories = ["./files", "./files/downloads", "./files/logs"];
        for (var i = 0; i < directories.length; i++)
            if (!fs.exists(directories[i]))
                fs.mkdir(directories[i]);
        // initiate bot
        this._client.on("ready", () =>
        {
            clearInterval(id);
            readline.moveCursor(process.stdout, -4, 0);
            process.stdout.write(`READY\n${Printer.error("-------------------------------------")}\n`);
        });
        this._client.on("message", (message) => { this.onMessage(message); });
        this._client.on("disconnect", (arg_0, arg_1: number) => 
        {
            console.log("Client disconnected :");
            console.log(`${JSON.stringify(arg_0)}, ${arg_1}`);
        })
        this._client.login(TokenReader.getToken());
    }

    private onMessage(message: Message): void 
    {
        let content = message.content;
        if (content.startsWith(this.prefix) && this.parents.includes(message.author.tag))
        {
            console.log("\ncommand requested by : " + Printer.info(message.author.tag));
            let substr = 0;
            let name = "";
            while (substr < content.length && content[substr] != "-" && content[substr] != " ")
            {
                name += content[substr];
                substr++;
            }
            try
            {
                let handled = this.logger.handle(message);
                if (!handled)
                {
                    let command = CommandFactory.create(name.substr(1), message, this);
                    command.execute()
                        .catch(error =>
                        {
                            if (error instanceof CustomError)
                            {
                                console.error(Printer.error(`${error.name} failed : ${error.message}`));
                                if (this.verbose)
                                {
                                    message.author.send(`Command (\`${error.name}\`) failed. Message : \n${error.message}`);
                                }
                            }
                            else if (this.verbose)
                            {
                                console.error(error);
                                message.author.send("Uh oh... Something went wrong ! Try again !");
                            }
                        });
                }
            } catch (error)
            {
                if (error instanceof CustomError)
                {
                    if (this.verbose)
                    {
                        console.error(Printer.error(error.message));
                        message.author.send(`Command (\`${error.name}\`) failed. Message : \n${error.message}`);
                    }
                }
                else if (this.verbose)
                {
                    console.error(error);
                    message.author.send("Uh oh... Something went wrong ! Try again !");
                }
            }
        }
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