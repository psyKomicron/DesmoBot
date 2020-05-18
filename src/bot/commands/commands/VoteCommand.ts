import Discord = require('discord.js');
import { Command } from '../Command';
import { EmojiReader } from '../../dal/Readers';
import { Printer } from '../../../console/Printer';
import { Bot } from '../../Bot';
import { VoteLogger } from './vote/VoteLogger';
import { WrongArgumentException } from '../../exceptions/customs/WrongArgumentException';

export class VoteCommand extends Command
{
    private id: number;
    private voteMessage: Discord.Message;
    private messageEmbed: Discord.MessageEmbed;
    private collector: Discord.ReactionCollector;
    private votes: Map<Discord.User, Discord.MessageReaction> = new Map();
    private reactions: Map<Discord.MessageReaction, Array<Discord.User>> = new Map();
    // values
    private timeout: number;
    private _title: string;
    private channel: Discord.Channel;
    private hostMessageID: Discord.Snowflake;
    private emojis: Array<Discord.Emoji> = new Array();
    private displayUsers: boolean;
    private usingEmbed: boolean = false;

    public constructor(message: Discord.Message, bot: Bot)
    {
        super("vote", message, bot);
    }

    public get title(): string 
    {
        return this._title;
    }

    public async execute(): Promise<void> 
    {
        this.getParams(this.parseMessage());
        if (this.message.deletable)
            this.message.delete({ timeout: 100 });
        console.log(Printer.title("starting vote"));
        console.log(Printer.args(
            ["timeout", "vote reason", "vote channel id", "holding message (id)"],
            [`${this.timeout}`, this.title, this.channel?.id, `${this.hostMessageID}`]));
        if (this.channel instanceof Discord.TextChannel)
        {
            this.id = VoteLogger.log(this);
            let voteTime: string = "";
            if (this.timeout == undefined)
            {
                voteTime = "no limit";
            }
            else
            {
                voteTime = `${this.timeout} seconds`;
            }
            if (!this.hostMessageID)
            {
                this.messageEmbed = new Discord.MessageEmbed()
                    .setTitle(this.title)
                    .addField("Time limit", voteTime)
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setFooter("Vote id : " + this.id);
                this.voteMessage = await (this.channel as Discord.TextChannel)?.send(this.messageEmbed);
                this.emojis.push(new Discord.Emoji(this.bot.client, { name: EmojiReader.getEmoji("green_check") }));
                this.emojis.push(new Discord.Emoji(this.bot.client, { name: EmojiReader.getEmoji("green_cross") }));
            }
            else
            {
                this.usingEmbed = true;
                let hostMessage = await this.message.channel.messages.fetch(this.hostMessageID);
                if (hostMessage.embeds.length > 0)
                {
                    this.messageEmbed = hostMessage.embeds[0];
                    this.messageEmbed.fields.forEach(field =>
                    {
                        let emoji: Discord.Emoji;
                        try
                        {
                            emoji = new Discord.Emoji(this.bot.client, { name: field.name });
                        } catch (e)
                        {
                            try
                            {
                                emoji = new Discord.Emoji(this.bot.client, { name: field.value });
                            }
                            catch (e) { }
                        }
                        if (emoji)
                        {
                            this.emojis.push(emoji);
                        }
                    });
                }
                else throw new WrongArgumentException(this);
                this.voteMessage = hostMessage;
            }
            if (this.voteMessage.author.tag == this.bot.client.user.tag)
            {
                var collector = this.voteMessage.createReactionCollector(
                    (reaction: Discord.MessageReaction, user: Discord.User) => !user.bot,
                    { time: this.timeout == undefined ? this.timeout : this.timeout * 1000, dispose: true });
                collector.on('collect', (reaction: Discord.MessageReaction, user: Discord.User) =>
                {
                    this.votes.set(user, reaction);
                    if (this.reactions.has(reaction))
                    {
                        this.reactions.get(reaction).push(user);
                    }
                    else
                    {
                        this.reactions.set(reaction, new Array<Discord.User>());
                        this.reactions.get(reaction).push(user);
                    }
                });
                collector.on('remove', (reaction: Discord.MessageReaction, user: Discord.User) =>
                {
                    this.votes.delete(user);
                    // remove from array
                    let users = this.reactions.get(reaction);
                    let newUsers = new Array<Discord.User>();
                    users.forEach(value =>
                    {
                        if (value.tag != user.tag)
                            newUsers.push(value);
                    });
                    this.reactions.set(reaction, newUsers);
                });
                collector.on('end', () =>
                {
                    this.voteMessage.edit("**Vote ended !**");
                    let embed = new Discord.MessageEmbed()
                        .setColor(this.messageEmbed.color)
                        .setTitle("Results for " + this.messageEmbed.title);
                    // copy old embed
                    if (this.usingEmbed)
                    {
                        this.messageEmbed.fields.forEach(field =>
                        {
                            embed.addField(field.name, field.value, true);
                        });
                    }
                    // get reactions
                    this.reactions.forEach((users, reaction) =>
                    {
                        let emoji = reaction.emoji.name;
                        let votes = "";
                        if (this.displayUsers)
                        {
                            users.forEach(user =>
                            {
                                votes += "<@" + user.id + ">, ";
                            });
                        }
                        else
                        {
                            votes += users.length;
                        }
                        embed.addField(emoji, votes, true);
                    });
                    this.voteMessage.edit(embed);
                    this.voteMessage.reactions.removeAll();
                });
                this.emojis.forEach(emoji =>
                {
                    this.voteMessage.react(emoji.name)
                        .catch();
                });
                this.voteMessage.pin();
                this.collector = collector;
            }
            else
            {
                // "The vote command failed. Check syntax or see if the message used to host the vote was sent by me"
                throw new WrongArgumentException(this);
            }
        }
    }

    public end(reason: string): void
    {
        if (this.collector && !this.timeout)
        {
            this.collector.stop(reason);
        }
    }

    private getParams(map: Map<string, string>): void
    {
        let timeout: number = 60;
        let title: string = "Yes/No";
        let channel: Discord.Channel = this.message.channel;
        let message: Discord.Snowflake;
        let reactions: Array<Discord.Emoji> = new Array();
        let displayUsers = false;
        map.forEach((value, key) =>
        {
            switch (key)
            {
                case "title":
                case "r":
                    if (value != "")
                        title = value;
                    break;
                case "timeout":
                case "n":
                    if (!Number.isNaN(Number.parseInt(value)))
                        timeout = Number.parseInt(value);
                    else if (value == "nolimit")
                        timeout = undefined;
                    break;
                case "channel":
                case "c":
                    let resolvedChannel = this.message.guild.channels.resolve(value);
                    if (resolvedChannel && resolvedChannel instanceof Discord.TextChannel)
                        channel = resolvedChannel;
                    break;
                case "message":
                case "m":
                    try
                    {
                        let desconstructedSnowflake = Discord.SnowflakeUtil.deconstruct(value);
                        if (desconstructedSnowflake)
                        {
                            message = value;
                        }
                    }
                    catch (e)
                    {
                        message = undefined;
                    }
                    break;
                case "reactions":
                    let emojis = value.split(" ");
                    emojis.forEach(emoji =>
                    {
                        try
                        {
                            reactions.push(new Discord.Emoji(this.bot.client, emoji as Object));
                        } catch (error) { }
                    })
                    break;
                case "displayusers":
                    displayUsers = true;
                    break;
            }
        });
        this.timeout = timeout;
        this._title = title;
        this.channel = channel;
        this.hostMessageID = message;
        this.emojis = reactions;
        this.displayUsers = displayUsers;
    }
}