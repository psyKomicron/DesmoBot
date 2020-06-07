import { Bot } from '../../Bot';
import { Printer } from '../../../console/Printer';
import { Command } from '../Command';
import { EmojiReader } from '../../dal/Readers';
import { VoteLogger } from '../../logger/loggers/VoteLogger';
import { WrongArgumentError } from '../../errors/exec_errors/WrongArgumentError';
import
    {
        Message, MessageReaction, MessageEmbed,
        User,
        ReactionCollector,
        Snowflake, SnowflakeUtil,
        Emoji,
        Channel, TextChannel
    } from 'discord.js';

export class VoteCommand extends Command
{
    private voteMessage: Message;
    private messageEmbed: MessageEmbed;
    private collector: ReactionCollector;
    private votes: Map<User, MessageReaction> = new Map();
    private reactions: Map<MessageReaction, Array<User>> = new Map();
    // values
    private timeout: number;
    private _title: string;
    private channel: Channel;
    private hostMessageID: Snowflake;
    private emojis: Array<Emoji> = new Array();
    private displayUsers: boolean;
    private usingEmbed: boolean = false;

    public constructor(bot: Bot)
    {
        super("vote", bot);
    }

    public get title(): string 
    {
        return this._title;
    }

    public async execute(message: Message): Promise<void> 
    {
        this.getParams(this.parseMessage(message), message);
        if (!this.channel)
        {
            this.channel = message.channel;
        }
        this.deleteMessage(message);
        console.log(Printer.title("starting vote"));
        console.log(Printer.args(
            ["timeout", "vote reason", "vote channel id", "holding message (id)"],
            [`${this.timeout}`, this.title, this.channel?.id, `${this.hostMessageID}`]));
        if (this.channel instanceof TextChannel)
        {
            let logger = new VoteLogger();
            this.bot.logger.addLogger(logger);
            let id = logger.logVote(this);
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
                this.messageEmbed = new MessageEmbed()
                    .setTitle(this.title)
                    .addField("Time limit", voteTime)
                    .setColor(Math.floor(Math.random() * 16777215))
                    .setFooter("Vote id : " + id);

                this.voteMessage = await (this.channel as TextChannel)?.send(this.messageEmbed);
                this.emojis.push(new Emoji(this.bot.client, { name: EmojiReader.getEmoji("green_check") }));
                this.emojis.push(new Emoji(this.bot.client, { name: EmojiReader.getEmoji("green_cross") }));
            }
            else
            {
                this.usingEmbed = true;
                let hostMessage = await message.channel.messages.fetch(this.hostMessageID);
                if (hostMessage.embeds.length > 0)
                {
                    this.messageEmbed = hostMessage.embeds[0];
                    this.messageEmbed.fields.forEach(field =>
                    {
                        let emoji: Emoji;
                        try
                        {
                            emoji = new Emoji(this.bot.client, { name: field.name });
                        } catch (e)
                        {
                            try
                            {
                                emoji = new Emoji(this.bot.client, { name: field.value });
                            }
                            catch (e) { }
                        }
                        if (emoji)
                        {
                            this.emojis.push(emoji);
                        }
                    });
                }
                else throw new WrongArgumentError(this);
                this.voteMessage = hostMessage;
            }
            if (this.voteMessage.author.tag == this.bot.client.user.tag)
            {
                var collector = this.voteMessage.createReactionCollector(
                    (reaction: MessageReaction, user: User) => !user.bot,
                    { time: this.timeout == undefined ? this.timeout : this.timeout * 1000, dispose: true });
                collector.on('collect', (reaction: MessageReaction, user: User) =>
                {
                    this.votes.set(user, reaction);
                    if (this.reactions.has(reaction))
                    {
                        this.reactions.get(reaction).push(user);
                    }
                    else
                    {
                        this.reactions.set(reaction, new Array<User>());
                        this.reactions.get(reaction).push(user);
                    }
                });
                collector.on('remove', (reaction: MessageReaction, user: User) =>
                {
                    this.votes.delete(user);
                    //remove from array
                    let users = this.reactions.get(reaction);
                    let newUsers = new Array<User>();
                    users.forEach(value =>
                    {
                        if (value.tag != user.tag)
                            newUsers.push(value);
                    });
                    this.reactions.set(reaction, newUsers);
                });
                collector.on('end', () =>
                {
                    this.emit("end");
                    this.voteMessage.edit("**Vote ended !**");
                    let embed = new MessageEmbed()
                        .setColor(this.messageEmbed.color)
                        .setTitle("Results for " + this.messageEmbed.title);
                    //copy old embed
                    if (this.usingEmbed)
                    {
                        this.messageEmbed.fields.forEach(field =>
                        {
                            embed.addField(field.name, field.value, true);
                        });
                    }
                    //get reactions
                    this.reactions.forEach((users, reaction) =>
                    {
                        let emoji = reaction.emoji.name;
                        let votes = "";
                        if (this.displayUsers)
                        {
                            users.forEach(user =>
                            {
                                votes += `<@${user.id}>, `;
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
                throw new WrongArgumentError(this, "The vote command failed. Check syntax or see if the message used to host the vote was sent by me");
            }
        }
    }

    public end(reason: string): void
    {
        if (this.collector)
        {
            this.collector.stop(reason);
        }
    }

    private getParams(map: Map<string, string>, message: Message): void
    {
        let timeout: number = 60;
        let title: string = "Yes/No";
        let channel: Channel;
        let messageID: Snowflake;
        let reactions: Array<Emoji> = new Array();
        let displayUsers = false;
        map.forEach((value, key) =>
        {
            switch (key)
            {
                case "title":
                case "r":
                    if (value != "")
                    {
                        title = value;
                    }
                    break;
                case "timeout":
                case "n":
                    if (!Number.isNaN(Number.parseInt(value)))
                    {
                        timeout = Number.parseInt(value);
                    }
                    else if (value == "nolimit")
                    {
                        timeout = undefined;
                    }
                    break;
                case "channel":
                case "c":
                    channel = this.resolveTextChannel(value, message.guild.channels);
                    break;
                case "message":
                case "m":
                    try
                    {
                        let desconstructedSnowflake = SnowflakeUtil.deconstruct(value);
                        if (desconstructedSnowflake)
                        {
                            messageID = value;
                        }
                    }
                    catch (e)
                    {
                        messageID = undefined;
                    }
                    break;
                case "reactions":
                    let emojis = value.split(" ");
                    emojis.forEach(emoji =>
                    {
                        try
                        {
                            reactions.push(new Emoji(this.bot.client, emoji as Object));
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
        this.hostMessageID = messageID;
        this.emojis = reactions;
        this.displayUsers = displayUsers;
    }
}