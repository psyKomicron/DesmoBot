import readline = require('readline');
import { clearTimeout } from 'timers';
import { Bot } from '../../Bot';
import { Command } from "../Command";
import { Printer } from '../../../console/Printer';
import { ProgressBar } from '../../../console/effects/ProgressBar';
import { Message, TextChannel, Collection } from 'discord.js';

export class DeleteCommand extends Command
{
    private delete_values: [number, TextChannel, string];

    public constructor(bot: Bot)
    {
        super("delete", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        this.delete_values = this.getParams(this.parseMessage(message), message);
        console.log(Printer.title("deleting messages"));
        if (this.delete_values[1] != undefined && this.delete_values[2] == "")
        {
            console.log(Printer.args(
                ["number of messages", "channel name", "target user"],
                [`${this.delete_values[0]}`, `${this.delete_values[1].name}`, `${this.delete_values[2]}`]));
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
                .catch(() =>
                {
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
    }

    private async overrideDelete(channel: TextChannel): Promise<void>
    {
        let messages: Collection<string, Message> = await channel.messages.fetch();
        if (this.delete_values[2] != "")
        {
            messages = messages.filter((message) =>
            {
                let username = message.author.tag;
                return username == this.delete_values[2];
            });
        }
        let messagesToDelete: Array<Message> = new Array();
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
        let alive = true;
        for (let i = 0; i < messages.size && i < this.delete_values[0] && alive; i++)
        {
            let timeout = setTimeout(() =>
            {
                alive = false;
                readline.moveCursor(process.stdout, 64, -2);
                console.log(Printer.warn("deleting messages slower than planned, stopping"));
                readline.moveCursor(process.stdout, 0, 1);
            }, 10000);
            if (messagesToDelete[i].deletable) await messagesToDelete[i].delete({ timeout: 100 });
            bar.update(i + 1);
            clearTimeout(timeout);
        }
        console.log("");
    }

    private getParams(map: Map<string, string>, message: Message): [number, TextChannel, string]
    {
        let messages = 10;
        let channel: TextChannel = undefined;
        let username = "";
        if (message.channel instanceof TextChannel)
        {
            channel = message.channel;
        }
        map.forEach((value, key) =>
        {
            switch (key)
            {
                case "u":
                    let res = /([A-Za-z0-9]+#+[0-9999])\w+/.exec(value);
                    if (res && res[0] == value)
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
                    let resolvedChannel = this.resolveTextChannel(value, message.guild.channels);
                    if (resolvedChannel)
                    {
                        channel = resolvedChannel;
                    }
                    break;
                default:
            }
        });
        return [messages, channel, username];
    }
}