import Discord = require('discord.js');
import { Command } from "../Command";
import { Printer } from '../../../console/Printer';

export class ReplyCommand extends Command
{
    private values: [string, Discord.Snowflake];

    public constructor(message: Discord.Message)
    {
        super("reply command", message);
        let content = message.content;
        let tac = false;
        for (var i = 0; i < content.length && !tac; i++)
        {
            if (content[i] == "-") tac = true;
        }
        if (tac)
            this.values = this.getParams(this.parseMessage());
        else
            this.getFastParams(content);

    }

    public async execute(): Promise<void> 
    {
        console.log(Printer.title("reply"));
        // fetch message
        let replyMessage = await this.message.channel.messages.fetch(this.values[1]);
        if (replyMessage instanceof Discord.Message)
        {
            // good to go
            console.log(Printer.args(["message id", "reply content"], [this.values[1], this.values[0]]));
            let author = this.message.author.tag;
            let user = replyMessage.author.tag;
            let embed = this.buildEmbed(author, user);
            this.message.reply(embed)
                .catch(console.error);
        }
        else
            console.error(Printer.warn("Message not found"));
    }

    private getFastParams(content: string)
    {
        // get content
        content = content.substr(3);
        // fetch last message id not you
        let lastMessage = this.message.channel.lastMessage;
        let lastMessageID = lastMessage.id;
        if (lastMessage.author.tag == this.message.author.tag)
        {

        }
        else
        {
            let messages = await this.message.channel.messages.fetch({ limit: 10 });

        }
        this.values = [content, lastMessageID];
    }

    private getParams(args: Map<string, string>): [string, Discord.Snowflake]
    {
        let content: string = "";
        let snowflake: Discord.Snowflake;
        args.forEach((value, key) =>
        {
            switch (key)
            {
                case "id":
                    try
                    {
                        let desconstructedSnowflake = Discord.SnowflakeUtil.deconstruct(value);
                        if (desconstructedSnowflake)
                            snowflake = value;
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

    private buildEmbed(author: string, user: string): Discord.MessageEmbed
    {
        return new Discord.MessageEmbed()
            .setColor(Math.floor(Math.random() * 16777215))
            .addField("", `${this.values[0]}`, true)
            .setFooter(`${author} replying to ${user}`);
    }
}