import Discord = require('discord.js');
import fs = require('fs');
import readline = require('readline');
import { TokenReader, EmojiReader } from './Readers';
import { Downloader } from '../network/Downloader';
import { Printer } from './Printer';

export class Bot 
{
    // own
    private prefix: string = "/";
    private readonly parents = ["psyKomicron#6527", "desmoclublyon#3056", "marquez#5719"];
    // discord
    private client: Discord.Client = new Discord.Client();
    // external
    private emojiReader: EmojiReader = new EmojiReader();

    public constructor() 
    {
        this.init();
    }

    private init(): void
    {
        this.client.on("ready", () => { console.log(Printer.info("--------------------------------------------") + "\n\t\tREADY"); });
        this.client.on("message", (message) => { this.onMessage(message); });
        this.client.login(TokenReader.getToken());
    }

    private onMessage(message: Discord.Message): void 
    {
        let content = message.content;
        let channel = message.channel;
        if (!content.startsWith(this.prefix) || !this.parents.includes(this.parseAuthor(message.author))) return;
        console.log("\ncommand requested by : " + Printer.info(this.parseAuthor(message.author)) + "\n");
        let command = content.split(/ /g);
        switch (command[1])
        {
            case "download":
                let pcmd = this.parseMessage(command);
                let limit = pcmd[0];    
                let type = pcmd[1];
                message.react(this.emojiReader.getEmoji("thinking"));
                console.log("> initiating download :");
                console.log("\tdownloading " + Printer.info(limit) + "\tfile type : " + Printer.info(type));
                if (limit > 250)
                {
                    console.log(Printer.warn("\n\t/!\\ WARNING : downloading over 250 files can fail /!\\ \n"));
                    message.react(this.emojiReader.getEmoji("warning"));
                }
                this.initiateDownload(limit, channel)
                    .then(() =>
                    {
                        message.react(this.emojiReader.getEmoji("green_check"));
                        if (message.deletable) message.delete({ timeout: 3000 });
                    });
                break;
            case "delete":
                if (channel instanceof Discord.TextChannel)
                    this.deleteBulk(channel);
                else
                    channel.send("cannot delete messages");
                break;
            default:
                message.reply("wrong command");
                break;
        }
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

    private async initiateDownload(numberOfFiles: number, channel: Discord.Channel): Promise<number>
    {
        let downloader = new Downloader();
        let lastMessageID: Discord.Snowflake = null;
        let limit = numberOfFiles > 50 ? 50 : numberOfFiles;
        let totalDownloads: number = 0;
        if (channel instanceof Discord.TextChannel)
        {
            console.log("downloading files with a " + Printer.info(""+limit) + " chunk");
            let messages = await channel.messages.fetch({ limit: limit });
            let filteredMessages = this.filterMessages(messages);//messages.filter(v => v.attachments.size > 0);
            console.log(Printer.normal("found " + Printer.info(filteredMessages.size) + " messages with attachements..."));
            let urls = this.hydrateUrls(filteredMessages);
            console.log("now have " + Printer.info(urls.length) + " matching files");
            if (urls.length < numberOfFiles)
                console.log(Printer.normal("not enough urls found, searching deeper\n"));
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
                    messages = await channel.messages.fetch({limit: limit, before: lastMessageID });
                    filteredMessages = messages.filter(v => v.attachments.size > 0);
                    let newUrls = this.hydrateUrls(filteredMessages);
                    newUrls.forEach(v => urls.push(v));

                    readline.moveCursor(process.stdout, 0, -1);
                    readline.clearLine(process.stdout, 0);
                    process.stdout.write("\tnow have " + Printer.info(urls.length) + " matching files\n");
                }
            }
            let filepath = "./files/" + channel.name;
            console.log("\nrequest to download " + Printer.info(urls.length) + " items in " + filepath);
            console.log("\t=> user requested " + Printer.info(numberOfFiles));
            fs.mkdir(filepath, { recursive: true }, (err) => { if (err) throw err; });
            filepath += "/";
            let copyArray: Array<string> = new Array();
            downloader.path = filepath;
            for (let i: number = 0; i < urls.length && i <= numberOfFiles; i++, totalDownloads++)
            {
                if (urls[i] != undefined)
                    copyArray.push(urls[i]);
            }
            downloader.download(copyArray);
        }
        return totalDownloads;
    }

    private parseMessage(command: string[]): [number, FileType]
    {
        let limit = 50;
        let type = FileType.FILE;
        if (command.length > 2)
        {
            if (command.length > 3)
            {
                // got all args
                // order correct ?
                if (!Number.isNaN(Number.parseInt(command[2])))
                {
                    limit = Number.parseInt(command[2]);
                    type = this.getFileType(command[3]);
                }
                else if (!Number.isNaN(Number.parseInt(command[3])))
                {
                    limit = Number.parseInt(command[3]);
                    type = this.getFileType(command[2]);
                }
            }
            else
            {
                // only 1 arg
                // ? number or type
                if (Number.isNaN(Number.parseInt(command[2])))
                {
                    type = this.getFileType(command[2]);
                }
                else
                {
                    limit = Number.parseInt(command[2]);
                }
            }
        }
        return [limit, type];
    }

    private hydrateUrls(messages: Discord.Collection<string, Discord.Message>, type: FileType = FileType.IMG): Array<string>
    {
        let urls = new Array();
        messages.forEach(message =>
        {
            message.attachments.forEach(attachement =>
            {
                if (type == FileType.IMG) // image files (png, jpg, gif)
                {
                    if (this.isImage(attachement.url))
                    {
                        urls.push(attachement.url);
                    }
                }
            });
        });
        return urls;
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

    private deleteBulk(channel: Discord.TextChannel): void
    {
        channel.bulkDelete(10);
    }

    private parseAuthor(author: Discord.User): string
    {
        let username = author.username;
        let discriminator = author.discriminator;
        return username + "#" + discriminator;
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
}

export enum FileType
{
    PDF = "pdf",
    IMG = "image",
    VIDEO = "video",
    CODE = "code",
    FILE = "all",
}