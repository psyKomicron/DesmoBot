import Discord = require('discord.js');
import fs = require('fs');
import { Command } from './Command';
import { Printer } from '../../ui/Printer';
import { Downloader } from '../../network/Downloader';

export class EmbedCommand extends Command
{
    private message: Discord.Message;
    private embedValues: [string, boolean]

    public constructor(message: Discord.Message)
    {
        super("embed builder");
        this.message = message;
        this.embedValues = this.getParams(this.parseMessage(this.message));
    }

    public async execute(): Promise<Object> 
    {
        // 1 -get & download file
        // 2 -parse & check message
        let fileUrl: string;
        this.message.attachments.forEach(value =>
        {
            if (value.url.endsWith(".json")) fileUrl = value.url;
        });
        if (fileUrl)
        {
            this.embedValues[0] = Downloader.getFileName(fileUrl);
            console.log(Printer.args(
                ["json file name", "json file url", "delete after execution"],
                [`${this.embedValues[0]}`, `${fileUrl}`, `${this.embedValues[1]}`]
            ));
            let downloader = new Downloader();
            downloader.path = "./files/";
            await downloader.download([fileUrl]);
            setTimeout(() =>
            {
                let fileContent = fs.readFileSync(`./files/${this.embedValues[0]}`).toString();
                try
                {
                    let json = JSON.parse(fileContent);
                    if (this.checkProperties(json))
                    {
                        console.log(Printer.info("Object has all required properties"));
                        let embed = json["embed"];
                        console.log(Printer.args(
                            ["color", "description", "fields", "footer", "title"],
                            [embed["color"], embed["description"], embed["fields"], embed["footer"], embed["title"]]
                        ));
                        let discordEmbed = new Discord.MessageEmbed()
                            .setColor(embed["color"])
                            .setDescription(embed["description"])
                            .setFooter(embed["footer"])
                            .setTitle(embed["title"]);
                        let fields = embed["fields"];
                        for (var i = 0; i < fields.length; i++)
                        {
                            let title = fields[i]["title"];
                            let value = fields[i]["description"];
                            discordEmbed.addField(title, value);
                        }
                        this.message.channel.send(discordEmbed);
                    }
                    else
                    {
                        throw "Cannot use object";
                    }
                }
                catch (error)
                {
                    console.error(Printer.error(error));
                }
            }, 1000);
        }
        else
        {
            console.log(Printer.args(
                ["json file name", Printer.error("json file url"), "delete after execution"],
                [`${this.embedValues[0]}`, `${Printer.error(fileUrl)}`, `${this.embedValues[1]}`]
            ));
            throw new Error("no valid uri/url for the json file");
        }
        // 3 -delete original message with 1 sec delay
        if (this.message.deletable && this.embedValues[1])
            this.message.delete({ timeout: 1000 });
        return "running";
    }

    private checkProperties(json: any): boolean
    {
        const properties = ["color", "description", "fields", "footer", "title"];
        let checked = false;
        let hasAll = false;
        let embed = json["embed"];
        for (var i = 0; i < properties.length; i++)
        {
            if (!embed[properties[i]])
            {
                hasAll = false;
                console.log("Object doesn't have property " + Printer.error(properties[i]));
                break;
            }
            else hasAll = true;
        }
        if (hasAll)
        {
            let fields = embed["fields"];
            for (var j = 0; j < fields.length; j++)
            {
                if (!fields[j]["title"] || !fields[j]["description"])
                {
                    checked = false;
                    break;
                }
                else checked = true;
            }
        }
        return checked;
    }

    private getParams(args: Map<string, string>): [string, boolean]
    {
        let willDelete: boolean = false;
        args.forEach((value, key) =>
        {
            switch (key)
            {
                case "d":
                    willDelete = true;
                    break;
                default:
            }
        });
        return ["", willDelete];
    }
}