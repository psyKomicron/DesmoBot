import Discord = require('discord.js');
import fs = require('fs');
import { Command } from "./Command";
import { FileType } from "../Bot";
import { Printer } from '../ui/Printer';
import { EmojiReader } from '../Readers';
import { Downloader } from '../../network/Downloader';
import { ProgressBar } from '../../ui/web/effects/ProgressBar';
import { WebServer } from '../../ui/web/WebServer';

export class DownloadCommand extends Command
{
    private emojiReader: EmojiReader = new EmojiReader();
    private message: Discord.Message;
    private downloadValues: [number, FileType, Discord.Channel, number];

    public constructor(message: Discord.Message)
    {
        super("download");
        this.message = message;
        this.downloadValues = this.getParams(this.parseMessage(message));
    }

    public async execute(): Promise<string> 
    {
        let limit = this.downloadValues[0];
        let type = this.downloadValues[1];
        let channel = this.downloadValues[2];
        let name = "";
        if (channel instanceof Discord.TextChannel)
            name = channel.name;
        this.message.react(this.emojiReader.getEmoji("thinking"));
        console.log(Printer.title("initiating download"));
        console.log(Printer.args(
            ["downloading", "file type", "channel"],
            [`${limit}`, `${type}`, `${name}`]
        ));
        if (limit > 250)
        {
            console.log(Printer.warn("\n\t/!\\ WARNING : downloading over 250 files can fail /!\\ \n"));
            this.message.react(this.emojiReader.getEmoji("warning"));
        }
        this.initiateDownload(limit, channel)
            .then(() =>
            {
                this.message.react(this.emojiReader.getEmoji("green_check"));
                if (this.message.deletable) this.message.delete({ timeout: 2000 });
            });
        return "executed";
    }

    private async initiateDownload(numberOfFiles: number, channel: Discord.Channel): Promise<number>
    {
        let downloader = new Downloader();
        let lastMessageID: Discord.Snowflake = null;
        let limit = numberOfFiles > 50 ? 50 : numberOfFiles;
        let totalDownloads: number = 0;
        if (channel instanceof Discord.TextChannel)
        {
            console.log("downloading files with a " + Printer.info("" + limit) + " chunk");
            let messages = await channel.messages.fetch({ limit: limit });
            let filteredMessages = this.filterMessages(messages);
            console.log(Printer.normal("found " + Printer.info(filteredMessages.size) + " messages with attachements..."));
            let urls = this.hydrateUrls(filteredMessages);
            console.log("have " + Printer.info(urls.length) + " matching files");

            if (urls.length < numberOfFiles)
            {
                console.log(Printer.normal("not enough urls found, searching deeper"));
                let bar = new ProgressBar(numberOfFiles, "fetching urls");
                bar.start();
                // fetching all requested urls
                while (urls.length < numberOfFiles) 
                {
                    lastMessageID = await messages.last()?.id;
                    if (lastMessageID == undefined)
                    {
                        console.log(Printer.warn("not more messages to parse, breaking"));
                        break;
                    }
                    else
                    {
                        messages = await channel.messages.fetch({ limit: limit, before: lastMessageID });
                        filteredMessages = messages.filter(v => v.attachments.size > 0);
                        let newUrls = this.hydrateUrls(filteredMessages);
                        newUrls.forEach(v => urls.push(v));
                        bar.update(urls.length);
                    }
                }
            }
            let filepath = "./files/" + channel.name;
            fs.mkdir(filepath, { recursive: true }, (err) => { if (err) throw err; });
            filepath += "/";
            let copyArray: Array<string> = new Array();
            downloader.path = filepath;
            for (let i: number = 0; i < urls.length && i < numberOfFiles; i++, totalDownloads++)
            {
                if (urls[i] != undefined)
                    copyArray.push(urls[i]);
            }
            console.log(`sending ${Printer.info(copyArray.length)} items in ${filepath} (user requested ${Printer.info(numberOfFiles)})`);
            downloader.download(copyArray)
                .then(() =>
                {
                    new WebServer(this.downloadValues[3]).startService();
                });
        }
        return totalDownloads;
    }

    /**
     * Parse a string array to retrieve necessary infos for 
     * this.initiateDownload method.
     * @param command content to parse (usually a message content)
     */
    private getParams(map: Map<string, string>): [number, FileType, Discord.Channel, number]
    {
        let limit = 50;
        let type = FileType.IMG;
        let channel: Discord.Channel = this.message.channel;
        let timeout: number;
        map.forEach((value, key) =>
        {
            switch (key)
            {
                case "t":
                    type = this.getFileType(value);
                    break;
                case "n":
                    if (!Number.isNaN(Number.parseInt(value)))
                    {
                        limit = Number.parseInt(value);
                    }
                    break;
                case "c":
                    let resolvedChannel = this.message.guild.channels.resolve(value);
                    if (resolvedChannel && resolvedChannel instanceof Discord.TextChannel)
                    {
                        channel = resolvedChannel;
                    }
                    break;
                case "s":
                    if (!Number.isNaN(Number.parseInt(value)))
                    {
                        timeout = Number.parseInt(value);
                    }
                    break;
                default:
            }
        });
        return [limit, type, channel, timeout];
    }

    private hydrateUrls(messages: Discord.Collection<string, Discord.Message>, type: FileType = FileType.IMG): Array<string>
    {
        let urls = new Array();
        messages.forEach(message =>
        {
            message.attachments.forEach(attachement =>
            {
                if (type == FileType.IMG) // image files (png, jpg, gif)
                    if (this.isImage(attachement.url))
                        urls.push(attachement.url);
            });
        });
        return urls;
    }

    /**
     * /!\ ONLY SUPPORTING PICTURES FOR NOW /!\
     * Filter the messages looking at their attachements or if they pack a link
     * @param messages messages to filter
     * @param type filter for the messages
     */
    private filterMessages(messages: Discord.Collection<string, Discord.Message>, type: FileType = FileType.IMG): Discord.Collection<string, Discord.Message>
    {
        let filteredArray = new Discord.Collection<string, Discord.Message>();
        messages.forEach((message, flake) =>
        {
            if (message.attachments.size > 0)
                filteredArray.set(flake, message);
            else
            {
                let content = message.content;
                if (type == FileType.IMG)
                {
                    // will fail when the link is contained in a text -> need to extract it
                    if (this.isImage(content))
                    {
                        message.attachments.forEach(attachement => { attachement.url = content })
                        filteredArray.set(flake, message);
                    }
                }
            }
        });
        return messages.filter(v => v.attachments.size > 0);;
    }

    private isImage(content: string)
    {
        return (Downloader.getFileName(content).endsWith(".png") ||
            Downloader.getFileName(content).endsWith(".PNG") ||
            Downloader.getFileName(content).endsWith(".jpg") ||
            Downloader.getFileName(content).endsWith(".JPG") ||
            Downloader.getFileName(content).endsWith(".gif") ||
            Downloader.getFileName(content).endsWith(".GIF"));
    }

    /**
     * Uses regex to id a uri in a string
     * @param content
     */
    private extractImage(content: string): string
    {
        return "";
    }

    private getFileType(name: string): FileType
    {
        let type;
        switch (name)
        {
            case "img":
            case "i":
                type = FileType.IMG;
                break;
            case "pdf":
                type = FileType.PDF;
                break;
            case "vid":
            case "v":
                type = FileType.VIDEO;
                break;
            case "code":
            case "c":
                type = FileType.CODE;
                break;
            default:
                type = FileType.FILE;
        }
        return type;
    }
}
