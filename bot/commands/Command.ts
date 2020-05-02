import fs = require('fs');
import Discord = require('discord.js');

export abstract class Command
{
    private static _commands: number = 0;
    private name: string;
    private values: Map<string, string>;

    protected constructor(name: string)
    {
        this.name = name;
    }

    public abstract async execute(): Promise<Object>;

    protected parseMessage(message: Discord.Message): Map<string, string>
    {
        // parse with args (-x -y...)
        let rawContent = message.content.substring(1);
        // remove command name
        let substr = 0;
        while (substr < rawContent.length && rawContent[substr] != "-") { substr++; }
        let content = rawContent.substring(substr);
        let map = new Map<string, string>();
        for (let i = 0; i < content.length; i++)
        {
            if (content[i] == "-")
            {
                if (i + 1 != content.length)
                {
                    let key = content[i + 1];
                    let value = "";
                    let j = i + 3;
                    if (content[j] == "\"")
                    {
                        j++;
                        let quote = false;
                        while (j < content.length && !quote)
                        {
                            if (content[j] != "\"")
                            {
                                value += content[j];
                            }
                            else quote = true;
                            j++;
                        }
                        i = j;
                    }
                    else
                    {
                        let tac = false;
                        while (j < content.length && !tac)
                        {
                            if (content[j] != '-' && content[j] != " ")
                                value += content[j];
                            else tac = true;
                            j++;
                        }
                    }
                    map.set(key, value);
                }
            }
        }
        this.values = map;
        this.writeLogs(map, message);
        return map;
    }

    public static get Commands(): number
    {
        return this._commands;
    }

    public get Name(): string
    {
        return this.name;
    }

    public get Values(): Map<string, string>
    {
        return this.values;
    }
    public set Values(values: Map<string, string>)
    {
        this.values = values;
    }

    private writeLogs(map: Map<string, string>, message: Discord.Message)
    {
        let filepath = "./files/logs";
        fs.mkdir(filepath, { recursive: true }, (err) => { if (err) throw err; });
        if (!fs.existsSync("./files/logs/command_logs.json"))           
        {
            let root = [];
            fs.writeFileSync(filepath + "/command_logs.json", JSON.stringify(root));
        }
        var logs = JSON.parse(fs.readFileSync(filepath + "/command_logs.json").toString());
        let now = new Date(Date.now());
        let data = {};
        map.forEach((value, key) =>
        {
            data[key]= value;
        });
        var json = {
            "user": [
                { "username": message.author.username },
                { "discriminator": message.author.discriminator }
            ],
            "command": [
                { "name": this.name },
                { "arguments": data },
                { "command number": `${Command.Commands}` }
            ],
            "date": [
                { "day": now.getDate() },
                { "month": now.getMonth() },
                { "year": now.getFullYear() },
                { "epoch": Date.now() }
            ]
        }
        logs.push(json);
        fs.writeFileSync(filepath + "/command_logs.json", JSON.stringify(logs));
    }
}