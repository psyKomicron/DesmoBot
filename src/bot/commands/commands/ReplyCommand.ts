import { Command } from "../Command";
import { Printer } from '../../../console/Printer';
import { Bot } from '../../Bot';
import { Message, Snowflake, SnowflakeUtil, MessageEmbed } from 'discord.js';

export class ReplyCommand extends Command
{
    private values: [string, Snowflake];

    public constructor(bot: Bot)
    {
        super("reply command", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        if (!message.content.match(/([-])/g))
        {
            this.values = this.getParams(this.parseMessage(message));
        }
        else
        {
            this.getFastParams(message);
        }
        console.log(Printer.title("reply"));
        // fetch message
        let replyMessage = await message.channel.messages.fetch(this.values[1]);
        if (replyMessage instanceof Message)
        {
            // good to go
            console.log(Printer.args(["message id", "reply content"], [this.values[1], this.values[0]]));
            let author = message.author.tag;
            let user = replyMessage.author.tag;
            let embed = this.buildEmbed(author, user);
            message.reply(embed)
                .catch(console.error);
        }
        else
        {
            console.error(Printer.warn("Message not found"));
        }
    }

    private getFastParams(message: Message)
    {
        // get content
        let content = message.content.substr(3);
        // fetch last message id not you
        let lastMessage = message.channel.lastMessage;
        let lastMessageID = lastMessage.id;
        if (lastMessage.author.tag == message.author.tag)
        {
            lastMessage = undefined;
        }
        this.values = [content, lastMessageID];
    }

    private getParams(args: Map<string, string>): [string, Snowflake]
    {
        let content: string = "";
        let snowflake: Snowflake;
        args.forEach((value, key) =>
        {
            switch (key)
            {
                case "id":
                    try
                    {
                        let desconstructedSnowflake = SnowflakeUtil.deconstruct(value);
                        if (desconstructedSnowflake)
                        {
                            snowflake = value;
                        }
                    }
                    catch (e)
                    {
                        snowflake = undefined;
                    }
                    break;
                case "m":
                    content = value;
                    break;
                default:
            }
        });
        return [content, snowflake];
    }

    private buildEmbed(author: string, user: string): MessageEmbed
    {
        return new MessageEmbed()
            .setColor(Math.floor(Math.random() * 16777215))
            .addField("", `${this.values[0]}`, true)
            .setFooter(`${author} replying to ${user}`);
    }
}