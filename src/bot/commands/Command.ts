import { Bot } from "../Bot";
import { EventEmitter } from "events";
import { FileSystem as fs } from "../dal/Readers";
import { Message, TextChannel, GuildChannel, GuildChannelManager} from 'discord.js';

export abstract class Command extends EventEmitter
{
    private static _commands: number = 0;
    private readonly _bot: Bot;
    private _name: string;
    //private _message: Message;

    protected constructor(name: string, bot: Bot)
    {
        super();
        Command._commands++;
        this._bot = bot;
        this._name = name;
    }

    /**Execute the command async */
    public abstract async execute(message: Message): Promise<void>;

    //public abstract async execute(message: Message): Promise<void>;

    public static get commands(): number { return this._commands; }

    public get name(): string { return this._name; }

    //protected get message(): Message { return this._message; }

    protected get bot(): Bot { return this._bot; }


    /**Delete the command message (here to avoid code redundancy) */
    public deleteMessage(message: Message, timeout: number = 100): void
    {
        if (message && message.deletable)
        {
            message.delete({ timeout: timeout });
        }
    }

    /**Parse the command message content to get parameters and returns a map of
     the arguments name paired with their values */
    public parseMessage(message: Message): Map<string, string>
    {
        let rawContent = message.content.substring(1);
        let substr = 0;
        while (substr < rawContent.length && rawContent[substr] != "-") { substr++; }
        let content = rawContent.substring(substr);
        let commas = 0;
        for (var j = 0; j < rawContent.length; j++)
        {
            if (rawContent[j] == "\"")
            {
                commas++;
            }
        }
        if (commas % 2 != 0)
        {
            throw new Error(`Command contains a space, but not incapsulated in \" \" (at character ${j + 1})`);
        }
        let map = new Map<string, string>();
        let i = 0;
        while (i < content.length)
        {
            if (content[i] == "-") {
                if (i + 1 != content.length) 
                {
                    let key: string = "";
                    for (i += 1; i < content.length; i++) 
                    {
                        if (content[i] != " ")
                        {
                            key += content[i];
                        }
                        else 
                        {
                            i++;
                            break;
                        }
                    }
                    let comma = false;
                    if (content[i] == "\"")
                    {
                        i++;
                        comma = true;
                    }
                    let value = "";
                    let marker = true;
                    while (i < content.length && marker) {
                        if ((content.charCodeAt(i) > 47 && content.charCodeAt(i) < 58) ||
                            (content.charCodeAt(i) > 64 && content.charCodeAt(i) < 91) ||
                            (content.charCodeAt(i) > 96 && content.charCodeAt(i) < 123))
                        {
                            value += content[i];
                        }
                        else if (content[i] != "\"" && comma)
                        {
                            value += content[i];
                        }
                        else marker = false;
                        if (marker) i++;
                    }
                    map.set(key, value);
                }
            }
            else i++;
        }
        this.writeLogs(map, message);
        return map;
    }

    /**
     * Resolve a text channel through the Discord API. Returns undefined if the id isn't
     * recognized.
     * @param channelID string-Discord.Snowflake representing a Discord.TextChannel id.
     * @returns The resolved TextChannel
     */
    public resolveTextChannel(channelID: string, manager: GuildChannelManager): TextChannel
    {
        let channel: TextChannel;
        let resolvedChannel = manager.resolve(channelID);
        if (resolvedChannel && resolvedChannel instanceof TextChannel)
        {
            channel = resolvedChannel;
        }
        return channel;
    }

    /**
     * Resolve a channel (text, voice, category, news, store) through the Discord API.
     * Returns undefined if the id isn't recognized.
     * @param channelID string | Discord.Snowflake representing a Channel id.
     * @returns The resolved GuildChannel.
     */
    public resolveChannel(channelID: string, manager: GuildChannelManager): GuildChannel
    {
        let channel: GuildChannel;
        let resolvedChannel = manager.resolve(channelID);
        if (resolvedChannel)
        {
            channel = resolvedChannel;
        }
        return channel;
    }

    /**
     * Write logs in a json file when the command asks to parse messages. If the file is to big, 
     * another file is created to store the newly created logs.
     * Logs user info (username, discriminator); command info (name, arguments, number of the 
     * command); message info and message.
     * @param map Arguments of the command
     * @param message Message that launched this command.
     */
    private async writeLogs(map: Map<string, string>, message: Message): Promise<void>
    {
        const filepath = "./files/logs/";
        const name = "command_logs";
        fs.mkdir(filepath, true);
        if (!fs.exists(filepath + name + ".json"))
        {
            let root = [];
            fs.writeFile(filepath + name + ".json", JSON.stringify(root));
        }
        var logs = JSON.parse(fs.readFile(filepath + name + ".json").toString());
        let now = new Date(Date.now());
        let data = {};
        map.forEach((value, key) =>
        {
            data[key]= value;
        });
        var json = {
            "user": [
                {
                    "username": message.author.username,
                    "discriminator": message.author.discriminator
                }
            ],
            "command": [
                {
                    "name": this._name,
                    "arguments": data,
                    "command number": `${Command.commands}`,
                    "message id": `${message.id}`,
                    "message": message
                }
            ],
            "date": [
                {
                    "day": now.getDate(),
                    "month": now.getMonth(),
                    "year": now.getFullYear(),
                    "epoch": Date.now()
                }
            ]
        }
        if (fs.getStats(filepath + name + ".json").size > 19000)
        {
            let index = 1;
            while (fs.exists(`${filepath}${name}(${index})`)) index++;
            fs.writeFile(`${filepath}${name}(${index}).json`, JSON.stringify(json));
        }
        else
        {
            logs.push(json);
            fs.writeFile(filepath + name + ".json", JSON.stringify(logs));
        }
    }
}