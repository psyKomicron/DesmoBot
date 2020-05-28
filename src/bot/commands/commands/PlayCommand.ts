import { Bot } from "../../Bot";
import { Command } from "../Command";
import { Printer } from "../../../console/Printer";
import { EmbedFactory } from "../factory/EmbedFactory";
import { YoutubeModule } from "./explore/youtube/YoutubeModule";
import { CommandSyntaxError } from "../../errors/customs/CommandSyntaxError";
import { WrongArgumentError } from "../../errors/customs/WrongArgumentError";
import { TokenReader, EmojiReader } from "../../dal/Readers";
import { Message, VoiceChannel, VoiceConnection } from "discord.js";
import { PlayLogger } from "../logger/loggers/PlayLogger";

export class PlayCommand extends Command
{
    private connection: VoiceConnection;
    private voiceChannel: VoiceChannel;
    private videoUrl: string;
    private _channelID: string;

    public constructor(message: Message, bot: Bot)
    {
        super("play-command", message, bot);
        this.getParams(this.parseMessage());
    }

    public get channel(): VoiceChannel { return this.voiceChannel; }

    public get channelID(): string { return this._channelID; }

    public async execute(): Promise<void> 
    {
        console.log(Printer.title("play"));
        console.log(Printer.args(["value provided", "? channel id"],
            [
                this.videoUrl == undefined ? "" : this.videoUrl,
                this._channelID == undefined ? "" : this._channelID
            ]));
        // check values
        if (this.videoUrl && this.videoUrl.match(/(https:\/\/www.youtube.com\/watch\?v=+)/g))
        {
            this.message.reply("Playing :\n" + this.videoUrl);
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
                // get user channel
                this.voiceChannel = this.message.member.voice.channel;
            }
            if (this.voiceChannel)
            {
                this.connection = await this.join();
                this.bot.logger.addLogger(new PlayLogger().logPlayer(this));
                setTimeout(() =>
                {
                    this.disconnect();
                }, 60000)
            }
            console.log(Printer.info("Joined " + this.voiceChannel?.name));
        }
        else if (this.videoUrl)
        {
            console.log("Searching for the keyword");
            let youtube = new YoutubeModule(TokenReader.getYoutubeAPIKey());
            let results = await youtube.searchVideos(this.videoUrl, 20, "en");
            if (results.items.length > 0)
            {
                let embed = EmbedFactory.build({
                    color: 16711680,
                    description: "Choose wich video to play",
                    footer: "powered by psyKomicron",
                    title: "Videos"
                });
                let items = results.items;
                for (var i = 0; i < items.length; i++)
                {
                    let name = `${i + 1}`.split("");
                    let num = "";
                    for (var j = 0; j < name.length; j++)
                    {
                        let index = Number.parseInt(name[j]);
                        num += EmojiReader.getEmoji(index);
                    }
                    embed.addField(`${num} - ${items[i].title}`, items[i].videoURL);
                }
                this.message.reply(embed);
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

    private getParams(args: Map<string, string>)
    {
        args.forEach((v, k) =>
        {
            switch (k)
            {
                case "u":
                case "url":
                    this.videoUrl = v;
                    break;
                case "c" :
                case "channel":
                    this._channelID = v;
                    break;
                default:
                    throw new CommandSyntaxError(this);
            }
        })
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
            this.connection.disconnect();
        }
    }
}