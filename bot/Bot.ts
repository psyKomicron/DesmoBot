import Discord = require('discord.js');
import { TokenReader } from './TokenReader';
import { Speaker, Reply } from '../lang/Speaker';
import { Downloader } from '../network/Downloader';

export class Bot 
{
    // own
    private prefix: string = "/";
    // discord
    private client: Discord.Client = new Discord.Client();
    private channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;
    // external
    private reader: TokenReader = new TokenReader();
    private speaker: Speaker = Speaker.init("IT");

    public constructor() 
    {
        this.init();
    }

    private init(): void
    {
        this.client.on("ready", () => { console.log("ready"); });
        this.client.on("guildMemberAdd", () => { this.greet(); });
        this.client.on("message", (message) => { this.onMessage(message); });
        this.client.login(this.reader.getToken());
    }

    public sendMessage(content: string): void
    {
        this.channel.send(content);
    }

    private onMessage(message: Discord.Message): void 
    {
        let content = message.content;
        if (!content.startsWith(this.prefix)) return;
        this.channel = message.channel;
        let command = content.split(/ /g);
        console.log(command.length);
        switch (command[1])
        {
            case "download":
                let pcmd = this.parseMessage(command);
                let limit = pcmd[0];
                let type = pcmd[1];
                message.reply(this.speaker.translate(Reply.DL_START))
                    .then(response =>
                    {
                        if (response.deletable) response.delete({ timeout: 2000 });
                        if (message.deletable) message.delete({ timeout: 2000 });
                    });
                console.log("downloading " + limit + " " + type + " files");
                this.initiateDownload(limit, type)
                    .then(n => console.log("Downloaded : " + n));
                break;
            case "delete":
                this.deleteBulk();
                break;
            default:
                this.channel.send(this.speaker.translate(Reply.WRONG_COMMAND));
                break;
        }
    }

    private async initiateDownload(numberOfFiles: number, type: FileType): Promise<number>
    {
        let downloader = new Downloader();
        let totalDownloads: number = 0;
        let limit = numberOfFiles > 50 ? 50 : numberOfFiles;
        let lastMessageID: Discord.Snowflake = null;
        if (this.channel instanceof Discord.TextChannel)
        {
            let messages = await this.channel.messages.fetch({ limit: limit });
            let filteredMessages = messages.filter(v => v.attachments.size > 0);
            console.log("found " + filteredMessages.size + " messages with attachements");
            let urls = this.hydrateUrls(filteredMessages, type);
            console.log("now have " + urls.length + " matching files");
            while (urls.length < numberOfFiles) // fetching all requested urls
            {
                console.log("not enough urls found, searching deeper");
                lastMessageID = await messages.last()?.id;
                if (lastMessageID == undefined)
                {
                    console.log("not more messages to parse, breaking");
                    break;
                }
                else
                {
                    messages = await this.channel.messages.fetch({limit: limit, before: lastMessageID });
                    filteredMessages = messages.filter(v => v.attachments.size > 0);
                    console.log("\tfound " + filteredMessages.size + " messages with attachements");
                    let newUrls = this.hydrateUrls(filteredMessages, type);
                    newUrls.forEach(v => urls.push(v));
                    console.log("\tnow have " + urls.length + " matching files");
                }
            }
            for (let i: number = 0; i < numberOfFiles; i++, totalDownloads++)
            {
                if (urls[i] != undefined)
                    downloader.download(urls[i]);
            }
        }
        return totalDownloads;
    }

    private parseMessage(command: string[]): [number, FileType]
    {
        let limit = 100;
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

    private greet(): void
    {
        this.channel.send("Benvenuto cavaliere !");
    }

    private deleteBulk(): void
    {
        this.channel.bulkDelete(10);
    }
}

export enum FileType
{
    PDF = "pdf",
    IMG = "jpg | png | JPG | PNG",
    FILE = "file",
}