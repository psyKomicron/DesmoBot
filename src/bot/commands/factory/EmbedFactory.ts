import { MessageEmbed, EmbedField, User } from 'discord.js';
import { JSONParser } from '../../dal/json/JSONParser';

export class EmbedFactory
{
    public static build(resolvable: EmbedFactoryResolvable): MessageEmbed
    {
        let messageEmbed: MessageEmbed = new MessageEmbed();
        messageEmbed
            .setTitle(resolvable.title)
            .setColor(resolvable.color)
            .setDescription(resolvable.description)
            .setFooter(resolvable.footer);
        let fields = resolvable.fields;
        if (fields)
        {
            for (var i = 0; i < fields.length && i < 25; i++)
            {
                messageEmbed.addField(fields[i].name, fields[i].value, fields[i]?.inline);
            }
        }
        return messageEmbed;
    }
}

export interface EmbedFactoryResolvable
{
    author?: User;
    color: number;
    description: string;
    footer: string;
    title: string;
    fields?: Array<EmbedField>;
}