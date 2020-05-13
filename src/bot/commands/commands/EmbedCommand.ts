import Discord = require('discord.js');
import { FileSystem as fs } from "../../dal/Readers";
import { Command } from '../Command';
import { Downloader } from '../../../network/Downloader';
import { Printer } from '../../../console/Printer';
import { JSONParser } from '../../dal/json/JSONParser';

export class EmbedCommand extends Command
{
    private embedValues: [Discord.TextChannel, boolean]

    public constructor(message: Discord.Message)
    {
        super("embed builder", message);
        this.embedValues = this.getParams(this.parseMessage());
        if (this.embedValues[0] == undefined)
            throw "Channel cannot be resolved";
    }

    public async execute(): Promise<void> 
    {
        // 1 -get & download file
        // 2 -check message & parse
        let fileUrl: string;
        this.message.attachments.forEach(value =>
        {
            if (value.url.endsWith(".json")) fileUrl = value.url;
        });
        if (fileUrl)
        {
            let jsonName = Downloader.getFileName(fileUrl);

            console.log(Printer.args(
                ["json file name", "json file url", "delete after execution", "channel"],
                [`${jsonName}`, `${fileUrl}`, `${this.embedValues[1]}`, `${this.embedValues[0].name}`]
            ));

            let downloader = new Downloader(this.Name);
            await downloader.download([fileUrl]);

            setTimeout(() =>
            {
                let fileContent = fs.readFile(`${downloader.path}${jsonName}`).toString();
                try
                {
                    let json = JSON.parse(fileContent);
                    let parser = new JSONParser();
                    const template =
                    {
                        "embed": {
                            "color": 1,
                            "description": "",
                            "fields": [ { "title": "", "description": "" } ],
                            "footer": "",
                            "title": ""
                        },
                    };
                    if (parser.matchTemplate(json, template))
                    {
                        Printer.clearPrint("Object has all required properties", [0, -2]);
                        console.log();
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
                        this.embedValues[0].send(discordEmbed);
                    }
                    else
                    {
                        throw "Cannot use object";
                    }
                }
                catch (error)
                {
                    if (error instanceof Error)
                    {
                        if (error.message == "Cannot use object")
                        {
                            Printer.clearPrint("", [0, -1]);
                            console.error(Printer.error(error.message));
                        }
                    }
                    else
                        console.error(error);

                }
                // cleaning directory async
                finally
                {
                    // removing the used json file
                    fs.unlink(`${downloader.path}${jsonName}`);
                    // removing the automaticaly generated log file
                    fs.unlink(`${downloader.path}logs.txt`);
                    fs.rmdir(`${downloader.path}`);
                }
            }, 1000);
        }
        else
        {
            console.log(Printer.args(
                [Printer.error("json file url"), "delete after execution"],
                [`${Printer.error(fileUrl)}`, `${this.embedValues[1]}`]
            ));
            throw new Error("no valid uri/url for the json file");
        }
        // 3 -delete original message with 1 sec delay
        if (this.message.deletable && this.embedValues[1])
            this.message.delete({ timeout: 100 });
    }

    public buildEmbed(): Discord.MessageEmbed
    {
        return null;
    }

    private getParams(args: Map<string, string>): [Discord.TextChannel, boolean]
    {
        let willDelete: boolean = false;
        let channel: Discord.TextChannel = this.message.channel instanceof Discord.TextChannel ? this.message.channel : undefined;
        args.forEach((value, key) =>
        {
            switch (key)
            {
                case "d":
                    willDelete = true;
                    break;
                case "c":
                    if (this.resolveChannel(value))
                        channel = this.resolveChannel(value);
                    break;
                default:
            }
        });
        return [channel, willDelete];
    }
}