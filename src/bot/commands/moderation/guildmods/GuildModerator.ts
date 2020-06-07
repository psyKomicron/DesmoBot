import { ResponseStatus } from "../../commands/moderation/Moderator";
import { Guild, User, Message } from "discord.js";

export class GuildModerator
{
    private readonly guild: Guild;
    private _level: number;
    private users: Map<User, ResponseStatus> = new Map();

    public constructor(guild: Guild, level: number = 3)
    {
        this.guild = guild;
        this._level = level;
    }

    public set level(level: number) { this._level = level; }
    public get level() { return this._level; }

    public handle(message: Message): ResponseStatus
    {
        let status: ResponseStatus;
        if (this.users.get(message.author) == ResponseStatus.BAN)
        {
            status = ResponseStatus.BAN;
            if (message.deletable)
            {
                message.delete({ timeout: 100 });
            }
        }
        return status;
    }

    private checkContent(content: string): void
    {
        let regex = new RegExp(/(qwerty)/g);
        let source = regex.source.replace(/(\(|\))/g, "");
        source += "|iam";
        let pRegex = new RegExp(`/${source}/g`);
    }
}