import Discord = require('discord.js');
import { Command } from './Command';
import { Printer } from '../Printer';

export class VoteCommand extends Command
{
    private message: Discord.Message;
    private voteChannel: Discord.TextChannel;
    private timeout: number;

    public constructor(message: Discord.Message)
    {
        super("vote", ["timeout : 5h"]);
        this.message = message;
    }

    public execute(): Promise<Object> 
    {
        
    }

}