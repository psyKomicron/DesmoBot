import Discord = require('discord.js');
import readline = require('readline');
import { Command } from "./Command";
import { Printer } from '../ui/Printer';
import { ProgressBar } from '../ui/ProgressBar';
import { clearTimeout } from 'timers';

export class DeleteCommand extends Command
{
    private message: Discord.Message;
    private delete_values: [number, Discord.TextChannel];

    public constructor(message: Discord.Message)
    {
        super("delete", []);
        this.message = message;
        this.delete_values = this.getParams(this.parseMessage(message));
    }

    private async overrideDelete(channel: Discord.TextChannel): Promise<string>
    {
        let messages: Discord.Collection<string, Discord.Message> = await channel.messages.fetch();
        let messagesToDelete: Array<Discord.Message> = new Array();
        messages.forEach(message => { if (message != undefined) messagesToDelete.push(message) });
        let bar = new ProgressBar(this.delete_values[0], "getting messages");
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
                messages.forEach(message => { if (message != undefined) messagesToDelete.push(message) });
                readline.moveCursor(process.stdout, 0, -1);
                readline.clearLine(process.stdout, 0);
                process.stdout.write("\tnow have " + Printer.info(messagesToDelete.length) + " messages\n");
            }
        }
        bar.start();
        for (let i = 0; i < messages.size && i < this.delete_values[0]; i++)
        {
            let timeout = setTimeout(() =>
            {
                readline.moveCursor(process.stdout, 64, -2);
                console.log(Printer.warn("deleting messages is taking too much time"));
                readline.moveCursor(process.stdout, 0, 1);
            }, 100);
            if (messagesToDelete[i].deletable) await messagesToDelete[i].delete({ timeout: 1 });
            bar.update(i + 1);
            clearTimeout(timeout);
        }
        console.log("");
        return "executed";
    }

    public async execute(): Promise<Object> 
    {
        if (this.delete_values[1] != undefined)
        {
            console.log(Printer.title("deleting messages"));
            console.log(Printer.args(
                ["number of messages", "channel name", "method"],
                [`${this.delete_values[0]}`, `${this.delete_values[1].name}`, "bulk delete"]));
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
        else
            return "error";
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

    private getParams(args: string[]): [number, Discord.TextChannel]
    {
        let messages = 10;
        let channel: Discord.TextChannel = undefined;
        if (this.message.channel instanceof Discord.TextChannel)
            channel = this.message.channel;
        if (args.length = 2)
        {
            // arg 0 -> number of messages
            if (!Number.isNaN(Number.parseInt(args[0])))
                messages = Number.parseInt(args[0]);
            //arg 1 -> channel id
            let resolvedChannel = this.message.guild.channels.resolve(args[1]);
            if (resolvedChannel && resolvedChannel instanceof Discord.TextChannel)
                channel = resolvedChannel;
        }
        if (args.length = 1)
        {
            // arg 0 -> channel id || number of messages
            let resolvedChannel = this.message.guild.channels.resolve(args[0]);
            if (resolvedChannel && resolvedChannel instanceof Discord.TextChannel)
                channel = resolvedChannel;
            else if (!Number.isNaN(Number.parseInt(args[0])))
                messages = Number.parseInt(args[0]);
        }
        return [messages, channel];
    }
}