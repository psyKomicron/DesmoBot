import { FileSystem as fs } from "../dal/Readers";
import { Message, TextChannel, GuildChannel} from 'discord.js';
import { Bot } from "../Bot";

export abstract class Command
{
    private static _commands: number = 0;
    private readonly _bot: Bot;
    private _name: string;
    private _message: Message;

    protected constructor(name: string, message: Message, bot: Bot)
    {
        Command._commands++;
        this._bot = bot;
        this._message = message;
        this._name = name;
    }

    /**Execute the command async */
    public abstract async execute(): Promise<void>;

    public static get commands(): number { return this._commands; }

    public get name(): string { return this._name; }

    protected get message(): Message { return this._message; }

    protected get bot(): Bot { return this._bot; }


    /**Delete the command message (here to avoid code redundancy) */
    public deleteMessage(): void
    {
        if (this.message && this.message.deletable)
        {
            this.message.delete();
        }
    }

    /**Parse the command message content to get parameters and returns a map of
     the arguments name paired with their values */
    public parseMessage(message: Message = this._message): Map<string, string>
    {
        // parse with args (-x -y...)
        let rawContent = message.content.substring(1);
        // remove command name
        let substr = 0;
        while (substr < rawContent.length && rawContent[substr] != "-") { substr++; }
        let content = rawContent.substring(substr);
        // check if commas are even
        let commas = 0;
        for (var j = 0; j < rawContent.length; j++)
            if (rawContent[j] == "\"") commas++;
        if (commas % 2 != 0)
            throw new Error(`Command contains a space, but not incapsulated in \" \" (at character ${j + 1})`);
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
    public resolveTextChannel(channelID: string): TextChannel
    {
        let channel: TextChannel;
        let resolvedChannel = this._message.guild.channels.resolve(channelID);
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
    public resolveChannel(channelID: string): GuildChannel
    {
        let channel: GuildChannel;
        let resolvedChannel = this._message.guild.channels.resolve(channelID);
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
    private writeLogs(map: Map<string, string>, message: Message)
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
                    "message id": `${this.message.id}`,
                    "message": this.message
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