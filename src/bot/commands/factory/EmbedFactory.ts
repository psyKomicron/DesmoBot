import Discord = require('discord.js');
import { JSONParser } from '../../dal/json/JSONParser';

export class EmbedFactory
{
    public static build(json: any): Discord.MessageEmbed
    {
        const template = {
            "embed": {
                "color": 1,
                "description": "",
                "footer": "",
                "title": ""
            }
        };
        if (!JSONParser.matchTemplate(json, template))
        {
            throw new TypeError("Object given to factory not matching \"MessageEmbed\" template");
        }
        let messageEmbed: Discord.MessageEmbed = new Discord.MessageEmbed();
        let embed = json["embed"];
        messageEmbed
            .setTitle(embed["title"])
            .setColor(embed["color"])
            .setDescription(embed["description"])
            .setFooter(embed["footer"]);
        let fields = embed["fields"];
        if (fields)
        {
            for (var i = 0; i < fields.length; i++)
            {
                messageEmbed.addField(fields[i]["title"], fields[i]["description"]);
            }
        }
        return messageEmbed;
    }
}