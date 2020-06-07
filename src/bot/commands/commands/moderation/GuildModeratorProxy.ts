import { ResponseStatus, Moderator } from "./Moderator";
import { GuildModerator } from "../../moderation/guildmods/GuildModerator";
import { Message, Guild } from "discord.js";
import { CustomError } from "../../../errors/CustomError";

export class GuildModeratorProxy
{
    private moderator: Moderator;
    private workers: Map<Guild, GuildModerator> = new Map();

    public constructor(mod: Moderator)
    {
        this.moderator = mod;
    }
    
    public handle(message: Message): void
    {
        let worker = this.workers.get(message.guild);
        if (!worker)
        {
            worker = new GuildModerator(message.guild);
            this.workers.set(message.guild, worker);
        }
        try
        {
            let status = worker.handle(message);
            this.moderator.sendMessage(status, message.author);
        } catch (error)
        {
            if (error instanceof CustomError)
            {
                console.error(error.toString());
            }
            else
            {
                console.error(error);
            }
        }
    }
}