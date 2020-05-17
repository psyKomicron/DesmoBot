import { FileSystem as fs } from "../dal/Readers";
import Discord = require('discord.js');
import { Bot } from "../Bot";

export abstract class Command
{
    private static _commands: number = 0;
    private readonly _bot: Bot;
    private name: string;
    private _message: Discord.Message;

    protected constructor(name: string, message: Discord.Message, bot: Bot)
    {
        Command._commands++;
        this.name = name;
        this._message = message;
        this._bot = bot;
    }

    public abstract async execute(): Promise<void>;

    public static get Commands(): number { return this._commands; }

    public get Name(): string { return this.name; }

    protected get message(): Discord.Message { return this._message; }

    protected get bot(): Bot { return this._bot; }

    protected parseMessage(): Map<string, string>
    {
        // parse with args (-x -y...)
        let rawContent = this._message.content.substring(1);
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
                            key += content[i];
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
                            value += content[i];
                        else if (content[i] != "\"" && comma)
                            value += content[i];
                        else marker = false;
                        if (marker) i++;
                    }
                    map.set(key, value);
                }
            }
            else i++;
        }
        this.writeLogs(map, this._message);
        return map;
    }

    protected resolveChannel(value: string): Discord.TextChannel
    {
        let channel: Discord.TextChannel;
        let resolvedChannel = this._message.guild.channels.resolve(value);
        if (resolvedChannel && resolvedChannel instanceof Discord.TextChannel)
        {
            channel = resolvedChannel;
        }
        return channel;
    }

    private writeLogs(map: Map<string, string>, message: Discord.Message)
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
                    "name": this.name,
                    "arguments": data,
                    "command number": `${Command.Commands}`,
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