import ytld = require('ytdl-core');
import { Bot } from "../../Bot";
import { Command } from "../Command";
import { Printer } from "../../../console/Printer";
import { PlayLogger } from "../logger/loggers/PlayLogger";
import { EmbedFactory } from "../factory/EmbedFactory";
import { YoutubeModule, SearchResults } from "./explore/youtube/YoutubeModule";
import { CommandSyntaxError } from "../../errors/customs/CommandSyntaxError";
import { WrongArgumentError } from "../../errors/customs/WrongArgumentError";
import { TokenReader, EmojiReader, FileSystem as fs } from "../../dal/Readers";
import { Message, MessageEmbed, EmbedField , VoiceChannel, VoiceConnection, StreamDispatcher } from "discord.js";

export class PlayCommand extends Command
{
    private connection: VoiceConnection;
    private dispacher: StreamDispatcher;
    private voiceChannel: VoiceChannel;
    private videos: Array<string> = new Array();
    private currentVideo: number = 0;
    private _channelID: string;

    public constructor(message: Message, bot: Bot)
    {
        super("play-command", message, bot);
        let params = this.getParams(this.parseMessage());
        this.videos = params.videos;
        this._channelID = params.channelID;
    }

    public get channel(): VoiceChannel { return this.voiceChannel; }

    public get channelID(): string { return this._channelID; }

    public async execute(): Promise<void> 
    {
        console.log(Printer.title("play"));
        console.log(Printer.args(["value provided", "? channel id"],
            [
                this.videos.length == 0 ? "" : `${this.videos.length}`,
                this._channelID == undefined ? "" : this._channelID
            ]));
        // check values
        let match = true;
        this.videos.forEach(url =>
        {
            if (!url.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
            {
                match = false;
            }
        })
        if (this.videos.length > 0 && match)
        {
            if (this._channelID)
            {
                let channel = this.resolveChannel(this._channelID);
                if (channel instanceof VoiceChannel)
                {
                    this.voiceChannel = channel;
                }
            }
            else
            {
                this.voiceChannel = this.message.member.voice.channel;
            }
            if (this.voiceChannel)
            {
                this.playStream();
            }
        }
        // else if value provided (-u) isn't a youtube url
        else if (this.videos)
        {
            console.log("Searching for the keyword");
            let youtube = new YoutubeModule(TokenReader.getYoutubeAPIKey());
            let results = new Array<SearchResults>();
            for (var k = 0; k < this.videos.length; k++)
            {
                await youtube.searchVideos(this.videos[i], 20, "en");
            }
            if (results.length > 0)
            {
                let embed = EmbedFactory.build({
                    color: 16711680,
                    description: "Choose wich video to play",
                    footer: "powered by psyKomicron",
                    title: "Videos"
                });
                let embedFields = new Array<EmbedField>();
                for (var l = 0; l < results.length; l++)
                {
                    let items = results[l].items;
                    for (var i = 0; i < items.length; i++)
                    {
                        let name = `${i + 1}`.split("");
                        let num = "";
                        for (var j = 0; j < name.length; j++)
                        {
                            let index = Number.parseInt(name[j]);
                            num += EmojiReader.getEmoji(index);
                        }
                        embedFields.push((
                            {
                                name: `${num} - ${items[i].title}`,
                                value: items[i].videoURL,
                                inline: false
                            }));
                    }
                }
                // try to merge embeds
                let embeds = new Array<MessageEmbed>();
                for (var m = 0; m < embedFields.length; m++)
                {
                    if ((m % 25) == 0)
                    {
                        embeds.push(embed);
                        embed = EmbedFactory.build({
                            color: 16711680,
                            description: "Choose wich video to play",
                            footer: "powered by psyKomicron",
                            title: "Videos"
                        });
                    }
                    embed.addField(embedFields[i].name, embedFields[i].value, embedFields[i].inline);
                }
                this.message.reply(embeds[0]);
                for (var n = 1; n < embeds.length; n++)
                {
                    this.message.channel.send(embeds[n]);
                }
            }
            else
            {
                throw new WrongArgumentError(this, "Cannot find the requested url");
            }
        }
        else
        {
            throw new CommandSyntaxError(this);
        }
    }

    public async join(): Promise<VoiceConnection>
    {
        let promise: VoiceConnection;
        if (this.voiceChannel.joinable)
        {
            promise = await this.voiceChannel.join();
        }
        return promise;
    }

    public disconnect(): void
    {
        if (this.connection)
        {
            this.dispacher.end();
            this.connection.disconnect();
        }
    }

    public addToPlaylist(message: Message): void
    {
        let params = this.getParams(this.parseMessage(message));
        params.videos.forEach(video =>
        {
            if (video.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
            {
                this.videos.push(video);
            }
        });
    }

    private async playStream(index: number = 0)
    {
        this.connection = await this.join();
        this.bot.logger.addLogger(new PlayLogger().logPlayer(this));
        try
        {
            this.dispacher = this.connection.play(ytld(this.videos[index], { quality: "highestaudio" }));
            this.dispacher.on("error", (error) =>
            {
                console.error(error);
                this.disconnect();
                this.message.reply("Uh oh... something broke !");
            });
            this.dispacher.on("start", (error) =>
            {
                this.message.channel.send(EmbedFactory.build({
                    color: 16711680,
                    description: this.videos[index],
                    footer: "powered by psyKomicron",
                    title: "Playing"
                }));
            });
            this.dispacher.on("close", () =>
            {
                console.log(Printer.info("closing"))
            });
            this.dispacher.on("speaking", (speaking) =>
            {
                if (!speaking)
                {
                    this.playNext();
                }
            });
        } catch (error)
        {
            console.log(error);
        }
    }

    public playNext(): void
    {
        if (this.videos.length > 0 && this.currentVideo + 1 < this.videos.length)
        {
            this.currentVideo++;
            this.playStream(this.currentVideo);
        }
    }

    private getParams(args: Map<string, string>): Params
    {
        let params: Params = {channelID: "", videos: new Array<string>()};
        args.forEach((v, k) =>
        {
            switch (k)
            {
                case "u":
                case "url":
                    params.videos.push(v);
                    break;
                case "c":
                case "channel":
                    params.channelID = v;
                    break;
                default:
                    throw new CommandSyntaxError(this);
            }
        });
        return params;
    }
}

interface Params
{
    channelID: string;
    videos: Array<string>
}