import fs = require('fs');
import { MessageEmbed } from 'discord.js';

export class BotEmbed
{
    private color: string;
    private description: string;
    private fields: [];
    private footer: string;
    private title: string;

    public constructor(filepath: string = "nopath", object: any = undefined)
    {

    }

    public build(filepath: string = "nopath", object: any = undefined): MessageEmbed
    {
        let messageEmbed = new MessageEmbed();
        filepath = filepath == "" ? "nopath" : filepath;

        return messageEmbed;
    }
}