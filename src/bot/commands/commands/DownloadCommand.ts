import Discord = require('discord.js');
import { Command } from "./Command";
import { Printer } from '../../../ui/effects/Printer';
import { FileType } from '../../Bot';
import { EmojiReader } from '../../Readers';
import { ProgressBar } from '../../../ui/effects/ProgressBar';
import { Downloader } from '../../../network/Downloader';

export class DownloadCommand extends Command
{
    private emojiReader: EmojiReader = new EmojiReader();
    private downloadValues: [number, FileType, Discord.Channel, number];

    public constructor(message: Discord.Message)
    {
        super("download", message);
        this.downloadValues = this.getParams(this.parseMessage());
    }

    public async execute(): Promise<string> 
    {
        let limit = this.downloadValues[0];
        if (limit < 0) return "error";
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

    private async initiateDownload(numberOfFiles: number, channel: Discord.Channel): Promise<void>
    {
        let lastMessageID: Discord.Snowflake = null;

        let limit = numberOfFiles > 50 ? 100 : 50;
        let totalDownloads: number = 0;
        if (channel instanceof Discord.TextChannel)
        {
            let messages = await channel.messages.fetch({ limit: limit });
            let filteredMessages = this.filterMessages(messages);
            let urls = this.hydrateUrls(filteredMessages);
            if (urls.length < numberOfFiles)
            {
                let bar = new ProgressBar(numberOfFiles, "fetching urls");
                bar.start();
                // fetching all requested urls
                while (urls.length < numberOfFiles) 
                {
                    lastMessageID = await messages.last()?.id;
                    if (lastMessageID == undefined)
                    {
                        break;
                    }
                    else
                    {
                        messages = await channel.messages.fetch({ limit: limit, before: lastMessageID });
                        filteredMessages = this.filterMessages(messages);
                        let newUrls = this.hydrateUrls(filteredMessages);
                        newUrls.forEach(v => urls.push(v));
                        bar.update(urls.length);
                    }
                }
            }
            let copyArray: Array<string> = new Array();
            let downloader = new Downloader(channel.name);
            for (let i: number = 0; i < urls.length && i < numberOfFiles; i++, totalDownloads++)
            {
                if (urls[i] != undefined)
                {
                    copyArray.push(urls[i]);
                }
            }
            downloader.download(copyArray)
                .then((message) =>
                {
                    console.log(message);
                });
        }
    }

    private hydrateUrls(urls: Array<string>, type: FileType = this.downloadValues[1]): Array<string>
    {
        let filteredUrls = new Array();
        urls.forEach(url =>
        {
            if (type == FileType.IMG) // image files (png, jpg, gif)
                if (this.isImage(url))
                    filteredUrls.push(url);
            if (type == FileType.FILE)
                filteredUrls.push(url);
        });
        return filteredUrls;
    }

    /**
     * /!\ ONLY SUPPORTING PICTURES FOR NOW /!\
     * Filter the messages looking at their attachements or if they pack a link
     * @param messages messages to filter
     * @param type filter for the messages
     */
    private filterMessages(messages: Discord.Collection<string, Discord.Message>, type: FileType = FileType.IMG): Array<string>
    {
        let filteredArray = new Array<string>();
        messages.forEach((message, flake) =>
        {
            if (message.attachments.size > 0)
            {
                message.attachments.forEach(attachement =>
                {
                    filteredArray.push(attachement.url);
                });
            }
            else
            {
                let content = message.content;
                if (type == FileType.IMG)
                {
                    let regex =
                        /(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                    let url = content.match(regex);
                    if (url != undefined)
                    {
                        if (this.isImage(url[0]))
                        {
                            filteredArray.push(url[0]);
                        }
                    }
                }
            }
        });
        return filteredArray;
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
                    if (this.resolveChannel(value))
                    {
                        channel = this.resolveChannel(value);
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
            case "file":
                type = FileType.FILE;
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