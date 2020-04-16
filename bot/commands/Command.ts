import Discord = require('discord.js');

export abstract class Command
{
    private name: string;
    private values: string[]

    protected constructor(name: string, values: string[])
    {
        this.name = name;
        this.values = values;
    }

    public abstract async execute(): Promise<Object>;

    protected parseMessage(message: Discord.Message): Array<string>
    {
        let params = new Array<string>();
        let strings = message.content.split(" ");
        let display = "";
        if (strings.length > 0)
        {
            for (let i = 2; i < strings.length; i++)
            {
                params.push(strings[i]);
                display += strings[i];
            }
        }
        return params;
    }

    public get Name(): string
    {
        return this.name;
    }

    public get Values(): string[]
    {
        return this.values;
    }
    public set Values(values: string[])
    {
        this.values = values;
    }
}