import Discord = require('discord.js');
import { Command } from "../Command";

export class HelpCommand extends Command
{
    private message: Discord.Message;

    public constructor(message: Discord.Message)
    {
        super("help", ["help command"]);
        this.message = message;
    }

    public async execute(): Promise<Object> 
    {
        let embed = new Discord.MessageEmbed()
            .setTitle("Help")
            .setColor(0xff0000)
            .setDescription("Help page for Julie");
        embed.addField("Explanations", "For commands examples, DO NOT INCLUDE \"[]\" when typing the commands");
        embed.addField("Download - /download",
            `/ download [number of files to download] [type of file] [channel id]
All fields a optional, default values are :
 - number of files to download : 50
 - type of file : images
 - channel id : where the message has been sent`);
        embed.addField("Delete - /delete", `/ delete [number of messages to delete] [channel id]
All fields a optional, default values are :
 - number of messages to delete : 10
 - channel id : where the message has been sent`);
        this.message.channel.send(embed);
        return "executed";
    }

}