import Discord = require('discord.js');
import readline = require('readline');
import { Command } from './Command';
import { Printer } from '../ui/Printer';
import { EmojiReader } from '../Readers';

export class VoteCommand extends Command
{
    // discord
    private message: Discord.Message;
    private voteChannel: Discord.Channel;
    private collector: Discord.ReactionCollector;
    // own
    private users: Map<Discord.User, boolean> = new Map();
    // arguments
    private maxVotes: number;
    private votes: number = 0;
    private reason: string;

    public constructor(message: Discord.Message)
    {
        super("vote", ["timeout : 5h"]);
        this.message = message;
        let values = this.getParams(this.parseMessage(this.message));
        this.maxVotes = values[0];
        this.reason = values[1];
        this.voteChannel = values[2];
    }

    public async execute(): Promise<Object> 
    {
        console.log(Printer.title("starting vote"));
        console.log(Printer.args(["max votes", "vote reason", "vote channel"], [`${this.maxVotes}`, this.reason, this.voteChannel.id]))
        if (this.voteChannel instanceof Discord.TextChannel)
        {
            this.voteChannel.send(this.reason)
                .then(message =>
                {
                    this.buildCollector(message);
                });
        }
        else return "error";
    }

    private buildCollector(message: Discord.Message): void
    {
        let emojiReader = new EmojiReader();
        let yes = emojiReader.getEmoji("green_check");

        this.collector = message.createReactionCollector((reaction, user) =>
        {
            return reaction.emoji.name == yes || !user.bot;
        });

        this.collector.addListener("remove", (reaction, user) =>
        {
            console.log(`! remove ${reaction.emoji.name}`);
            console.log(`- ${user.username} removed ${reaction.emoji.name}`);
        });

        this.collector.on("collect", (reaction, user) =>
        {
            console.log(`! collected ${reaction.emoji.name}`);
            console.log(`- ${user.username} reacted with ${reaction.emoji.name}`);
        });

        this.collector.on("dispose", (reaction, user) =>
        {
            console.log(`! dispose ${reaction.emoji.name}`);
            console.log(`- ${user.username} reacted with ${reaction.emoji.name}`);
        });

        this.collector.on("end", (collected) =>
        {
            console.log(`! vote ended`);
        });
    }

    private parseVote(vote: Discord.MessageReaction): boolean
    {
        return false;
    }

    private getParams(args: string[]): [number, string, Discord.Channel]
    {
        let maxVotes: number = 2;
        let reason: string = "Yes/No";
        let channel: Discord.Channel = this.message.channel;
        for (let arg in args)
        {
            if (this.message.guild.channels.resolve(arg) != undefined)
            {
                channel = this.message.guild.channels.resolve(arg);
            }
            else if (!Number.isNaN(Number.parseInt(arg)))
            {
                maxVotes = Number.parseInt(arg);
            }
            else if (arg != "")
            {
                reason = arg;
            }
        }
        return [maxVotes, reason, channel]
    }
}