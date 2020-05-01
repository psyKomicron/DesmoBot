import Discord = require('discord.js');
import readline = require('readline');
import { Command } from "./Command";
import { Printer } from '../ui/Printer';
import { ProgressBar } from '../../ui/web/effects/ProgressBar';
import { clearTimeout } from 'timers';

export class DeleteCommand extends Command
{
    private message: Discord.Message;
    private delete_values: [number, Discord.TextChannel, string];

    public constructor(message: Discord.Message)
    {
        super("delete");
        this.message = message;
        this.delete_values = this.getParams(this.parseMessage(message));
    }

    public async execute(): Promise<Object> 
    {
        console.log(Printer.title("deleting messages"));
        if (this.delete_values[1] != undefined && this.delete_values[2] == "")
        {
            console.log(Printer.args(
                ["number of messages", "channel name", "method", "target user"],
                [`${this.delete_values[0]}`, `${this.delete_values[1].name}`, "bulk delete", `${this.delete_values[2]}`]));
            let channel = this.delete_values[1];
            channel.bulkDelete(this.delete_values[0])
                .then(response =>
                {
                    let bar = new ProgressBar(response.size, "deleting messages");
                    bar.start();
                    let i = 1;
                    response.forEach(() =>
                    {
                        bar.update(i);
                        i++;
                    });
                })
                .catch(error =>
                {
                    readline.moveCursor(process.stdout, 0, -1);
                    readline.clearLine(process.stdout, 0);
                    console.log(Printer.args(["method            "], ["fetch delete"]));
                    console.log("while deleting messages : " + Printer.warn(error));
                    console.log("switching delete method to manual...");
                    this.overrideDelete(channel)
                        .catch(console.error);
                });
        }
        else if (this.delete_values[1] != undefined && this.delete_values[2] != "")
        {
            console.log(Printer.args(
                ["number of messages", "channel name", "method", "target user"],
                [`${this.delete_values[0]}`, `${this.delete_values[1].name}`, "target delete", `${this.delete_values[2]}`]));
            let channel = this.delete_values[1];
            this.overrideDelete(channel);
        }
        else
            return "error";
    }

    private async overrideDelete(channel: Discord.TextChannel): Promise<string>
    {
        let messages: Discord.Collection<string, Discord.Message> = await channel.messages.fetch();
        if (this.delete_values[2] != "")
        {
            messages = messages.filter((message) =>
            {
                let username = `${message.author.username.replace(" ", "")}#${message.author.discriminator}`;
                return username == this.delete_values[2];
            });
        }
        let messagesToDelete: Array<Discord.Message> = new Array();
        messages.forEach(message => { if (message != undefined) messagesToDelete.push(message) });
        while (messagesToDelete.length < this.delete_values[0]) 
        {
            let lastMessageID = await messages.last()?.id;
            if (lastMessageID == undefined)
            {
                console.log(Printer.warn("not more messages to parse, breaking"));
                break;
            }
            else
            {
                messages = await channel.messages.fetch({ limit: 50, before: lastMessageID });
                if (this.delete_values[2] != "")
                {
                    messages = messages.filter((message) =>
                    {
                        let username = `${message.author.username.replace(" ", "")}#${message.author.discriminator}`;
                        return username == this.delete_values[2];
                    });
                }
                messages.forEach(message => { if (message != undefined) messagesToDelete.push(message) });
            }
        }
        let bar = new ProgressBar(this.delete_values[0], "deleting messages");
        bar.start();
        for (let i = 0; i < messages.size && i < this.delete_values[0]; i++)
        {
            let timeout = setTimeout(() =>
            {
                readline.moveCursor(process.stdout, 64, -2);
                console.log(Printer.warn("deleting messages slower than planned"));
                readline.moveCursor(process.stdout, 0, 1);
            }, 10000);
            if (messagesToDelete[i].deletable) await messagesToDelete[i].delete({ timeout: 1 });
            bar.update(i + 1);
            clearTimeout(timeout);
        }
        console.log("");
        return "executed";
    }

    private getParams(map: Map<string, string>): [number, Discord.TextChannel, string]
    {
        let messages = 10;
        let channel: Discord.TextChannel = undefined;
        let username = "";
        if (this.message.channel instanceof Discord.TextChannel) channel = this.message.channel;

        map.forEach((value, key) =>
        {
            switch (key)
            {
                case "u":
                    if (/([A-Za-z]+#+[0-9999])\w+/.exec(value)[0] == value)
                    {
                        username = value;
                    }
                    break;
                case "n":
                    if (!Number.isNaN(Number.parseInt(value)))
                    {
                        if (!map.has("u"))
                            messages = Number.parseInt(value) + 1;
                        else messages = Number.parseInt(value);
                    }
                    break;
                case "c":
                    let resolvedChannel = this.message.guild.channels.resolve(value);
                    if (resolvedChannel && resolvedChannel instanceof Discord.TextChannel)
                    {
                        channel = resolvedChannel;
                    }
                    break;
                default:
            }
        });
        return [messages, channel, username];
    }

    private crop(message: Discord.Message): string
    {
        let res: string;
        if (message.content.length > 10)
        {
            res = message.content.substr(0, 10);
            res += "[...]";
        }
        else res = message.content;
        return res;
    }
}

interface Filter
{
    sort(value: any, key: any): Function;
}