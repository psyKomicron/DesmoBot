import Discord = require('discord.js');
import { Command } from "../Command";
import { Bot } from '../../Bot';

export class HelpCommand extends Command
{
    public constructor(message: Discord.Message, bot: Bot)
    {
        super("help", message, bot);
    }

    public async execute(): Promise<void> 
    {
        let embed = new Discord.MessageEmbed()
            .setTitle("Help")
            .setColor(0xff0000)
            .setDescription("Help page for Julie")
            .setURL("https://github.com/psyKomicron/Julie/blob/master/README.md")
            .addFields(
                { name: "Link", value: "https://github.com/psyKomicron/Julie/blob/master/README.md" }
            );
        this.message.channel.send(embed);
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