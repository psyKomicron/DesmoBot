import { Bot } from "../../../Bot";
import { Command } from "../../Command";
import { Printer } from "../../../../console/Printer";
import { CustomError } from "../../../errors/CustomError";
import { Message, User } from "discord.js";
import { GuildModeratorProxy } from "./GuildModeratorProxy";

export class Moderator extends Command
{
    private static instance: boolean = false;
    private guildModerator: GuildModeratorProxy;

    private constructor(bot: Bot)
    {
        super("moderator", bot)
        this.guildModerator = new GuildModeratorProxy(this);
    }

    /**Singleton */
    public static get(bot: Bot): Moderator
    {
        if (!Moderator.instance)
        {
            return new Moderator(bot);
        }
        else
        {
            throw new Error("Angel already here");
        }
    }

    public async execute(message: Message): Promise<void>
    {
        this.parseMessage(message);
        try
        {
            this.guildModerator.handle(message);
        } catch (error)
        {
            if (error instanceof CustomError)
            {
                console.error(Printer.error(error.toString()));
            }
            else
            {
                console.error(error);
            }
        }
    }

    public sendMessage(status: ResponseStatus, user: User)
    {
        switch (status)
        {
            case ResponseStatus.CLEAN:
                console.log(Printer.info("CLEAN"));
                break;
            case ResponseStatus.WARN:
                console.log(Printer.info("WARNING !"));
                break;
            case ResponseStatus.BAN:
                console.log(Printer.info("BANNED !"));
                break;
        }
    }
}

export enum ResponseStatus
{
    CLEAN,
    WARN,
    BAN
}