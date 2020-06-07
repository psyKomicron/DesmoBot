import { Bot } from '../../Bot';
import { Command } from "../Command";
import { Message, MessageEmbed } from 'discord.js';
import { DeprecatedCommandError } from "../../errors/exec_errors/DeprecatedCommandError";

export class HelpCommand extends Command
{
    public constructor(bot: Bot)
    {
        throw new DeprecatedCommandError();
        super("help", bot);
    }

    public async execute(message: Message): Promise<void> 
    {
        let embed = new MessageEmbed()
            .setTitle("Help")
            .setColor(0xff0000)
            .setDescription("Help page for Julie")
            .setURL("https://github.com/psyKomicron/Julie/blob/master/README.md")
            .addFields(
                { name: "Link", value: "https://github.com/psyKomicron/Julie/blob/master/README.md" }
            );
        message.channel.send(embed);
    }

    private get voteHelp(): string
    {
        return `\`/ vote [max number of votes] [vote reason] [channel id]
All fields a optional, default values are :
 - max number of votes : 1
 - vote reason : Yes/No
 - channel id : where the message has been sent`;
    }

    private get downloadHelp(): string
    {
        return `\`/ download [number of files to download] [type of file] [channel id]\`
All fields a optional, default values are :
 - number of files to download : 50
 - type of file : images
 - channel id : where the message has been sent`;
    }

    private get deleteHelp(): string
    {
        return `\`/ delete [number of messages to delete] [channel id]\`
All fields a optional, default values are :
 - number of messages to delete : 10
 - channel id : where the message has been sent`;
    }
}