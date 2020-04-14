import Discord = require('discord.js');
import fs = require('fs');
import readline = require('readline');
import { TokenReader, EmojiReader } from './Readers';
import { Downloader } from '../network/Downloader';
import { stdout } from 'process';

export class Bot 
{
    // own
    private prefix: string = "/";
    private readonly parents = ["psyKomicron@6527", "desmoclublyon#3056", "marquez#5719"];
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
        this.client.on("ready", () => { console.log("ready"); });
        this.client.on("message", (message) => { this.onMessage(message); });
        this.client.login(TokenReader.getToken());
    }

    private onMessage(message: Discord.Message): void 
    {
        let content = message.content;
        let channel = message.channel;
        if (!content.startsWith(this.prefix) || !this.parents.includes(this.parseAuthor(message.author))) return;
        console.log("\ncommand requested by : " + this.parseAuthor(message.author) + "\n");
        let command = content.split(/ /g);
        switch (command[1])
        {
            case "download":
                let pcmd = this.parseMessage(command);
                let limit = pcmd[0];    
                let type = pcmd[1];
                message.react(this.emojiReader.getEmoji("thinking"));
                console.log("Initiating download :");
                console.log("\tdownloading " + limit);
                console.log("\tfile type : " + type);
                if (limit > 250)
                {
                    console.log("\n\t/!\\ WARNING : downloading over 250 files can fail /!\\ \n");
                    message.react(this.emojiReader.getEmoji("warning"));
                }
                this.initiateDownload(limit, type, channel)
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

    private async initiateDownload(numberOfFiles: number, type: FileType, channel: Discord.Channel): Promise<number>
    {
        let downloader = new Downloader();
        let lastMessageID: Discord.Snowflake = null;
        let limit = numberOfFiles > 50 ? 50 : numberOfFiles;
        let totalDownloads: number = 0;
        if (channel instanceof Discord.TextChannel)
        {
            console.log("downloading files with a " + limit + " file chunk");
            let messages = await channel.messages.fetch({ limit: limit });
            let filteredMessages = messages.filter(v => v.attachments.size > 0);
            console.log("found " + filteredMessages.size + " messages with attachements...");
            let urls = this.hydrateUrls(filteredMessages, type);
            console.log("now have " + urls.length + " matching files");
            if (urls.length < numberOfFiles) console.log("not enough urls found, searching deeper\n");
            while (urls.length < numberOfFiles) // fetching all requested urls
            {
                lastMessageID = await messages.last()?.id;
                if (lastMessageID == undefined)
                {
                    console.log("not more messages to parse, breaking");
                    break;
                }
                else
                {
                    messages = await channel.messages.fetch({limit: limit, before: lastMessageID });
                    filteredMessages = messages.filter(v => v.attachments.size > 0);
                    let newUrls = this.hydrateUrls(filteredMessages, type);
                    newUrls.forEach(v => urls.push(v));

                    readline.moveCursor(process.stdout, 0, -1);
                    readline.clearLine(process.stdout, 0);
                    process.stdout.write("\tnow have " + urls.length + " matching files\n");
                }
            }
            let filepath = "./files/" + channel.name;
            console.log("\nrequest to download " + urls.length + " items in " + filepath);
            console.log("\t=> user requested " + numberOfFiles);
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

    private hydrateUrls(messages: Discord.Collection<string, Discord.Message>, type: FileType): Array<string>
    {
        let urls = new Array();
        messages.forEach(message =>
        {
            message.attachments.forEach(attachement =>
            {
                if (type == FileType.IMG) // image files (png, jpg, gif)
                {
                    if (Downloader.getFileName(attachement.url).endsWith(".png") ||
                        Downloader.getFileName(attachement.url).endsWith(".PNG") ||
                        Downloader.getFileName(attachement.url).endsWith(".jpg") ||
                        Downloader.getFileName(attachement.url).endsWith(".JPG") ||
                        Downloader.getFileName(attachement.url).endsWith(".gif") ||
                        Downloader.getFileName(attachement.url).endsWith(".GIF"))
                    {
                        urls.push(attachement.url);
                    }
                }
                if (type == FileType.PDF) // PDF files
                {
                    if (Downloader.getFileName(attachement.url).endsWith(".pdf"))
                    {
                        urls.push(attachement.url);
                    }
                }
                if (type == FileType.FILE)
                {
                    urls.push(attachement.url);
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
                type = FileType.IMG;
                break;
            case "pdf":
                type = FileType.PDF;
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
        return username + "@" + discriminator;
    }
}

export enum FileType
{
    PDF = "pdf",
    IMG = "jpg | png | JPG | PNG",
    FILE = "file",
}