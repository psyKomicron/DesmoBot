import Discord = require('discord.js');

export abstract class Command
{
    abstract async execute(): Promise<CommandResponse>;
}

export interface CommandResponse
{
    value: string;
}