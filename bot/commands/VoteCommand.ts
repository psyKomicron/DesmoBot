import Discord = require('discord.js');
import readline = require('readline');
import { Command } from './Command';
import { EmojiReader } from '../Readers';
import { Printer } from '../../ui/Printer';

export class VoteCommand extends Command
{
    private collector: Discord.ReactionCollector;
    private votes: Map<Discord.User, string> = new Map();
    private emojis: Map<string, boolean> = new Map();
    private voteValues: [number, string, Discord.Channel];

    public constructor(message: Discord.Message)
    {
        super("vote", message);
        this.voteValues = this.getParams(this.parseMessage());
        let emojiReader = new EmojiReader();
        this.emojis.set(emojiReader.getEmoji("green_check"), true);
        this.emojis.set(emojiReader.getEmoji("green_cross"), true);
    }

    public async execute(): Promise<Object> 
    {
        if (this.message.deletable)
            this.message.delete({ timeout: 100 });
        console.log(Printer.title("starting vote"));
        console.log(Printer.args(["timeout", "vote reason", "vote channel id"], [`${this.voteValues[0]}`, this.voteValues[1], this.voteValues[2].id]))
        if (this.voteValues[2] instanceof Discord.TextChannel)
        {
            this.buildCollector();
        }
        else return "error";
    }

    private async buildCollector(): Promise<void>
    {
        // build embed one day
        let embed = new Discord.MessageEmbed();
        embed.setTitle(this.voteValues[1]);
        embed.addField("Temps de vote ", this.voteValues[0] + " secondes", true);
        let voteMessage = await (this.voteValues[2] as Discord.TextChannel)?.send(embed);

        this.collector = voteMessage.createReactionCollector(
            (reaction: Discord.MessageReaction, user: Discord.User) => !user.bot,
            {
                time: this.voteValues[0] * 1000,
                dispose: true
            });
        this.collector.on('collect', (reaction: Discord.MessageReaction, user: Discord.User) =>
        {
            let emojiName = reaction.emoji.name;
            if (this.emojis.get(emojiName))
            {
                this.votes.set(user, emojiName);
            }
        });
        this.collector.on('remove', (reaction: Discord.MessageReaction, user: Discord.User) =>
        {
            let emojiName = reaction.emoji.name;
            if (this.votes.has(user) && this.emojis.get(emojiName)) // has voted and removed emoji is a vote emoji
            {
                this.votes.delete(user);
            }
        });
        this.collector.on('end', (collected: Discord.Collection<string, Discord.MessageReaction>, reason: string) =>
        {
            console.log(`Reaction collector ended, info : ${Printer.info(reason)}`);
            console.log(`collected ${collected.size} reactions, with ${this.votes.size} valid reactions`);
            embed.addField("DING DING DING !", "Le vote est fini", true);
        });
        voteMessage.react(new EmojiReader().getEmoji("green_check"))
            .catch(console.error);
    }

    private getParams(map: Map<string, string>): [number, string, Discord.Channel]
    {
        let timeout: number = 60;
        let reason: string = "Yes/No";
        let channel: Discord.Channel = this.message.channel;
        map.forEach((value, key) =>
        {
            switch (key)
            {
                case "r":
                    if (value != "")
                        reason = value;
                    break;
                case "n":
                    if (!Number.isNaN(Number.parseInt(value)))
                        timeout = Number.parseInt(value);
                    break;
                case "c":
                    let resolvedChannel = this.message.guild.channels.resolve(value);
                    if (resolvedChannel && resolvedChannel instanceof Discord.TextChannel)
                        channel = resolvedChannel;
                    break;
                default:
            }
        });
        return [timeout, reason, channel]
    }

    private buildEmbed(title: string, content: string = ""): Discord.MessageEmbed
    {
        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setFooter("Vote requested by " + this.message.author.username);
        //if ()
        return embed;
    }
}