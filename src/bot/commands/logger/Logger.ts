import { Message } from "discord.js";
import { Command } from '../Command';

export abstract class Logger
{
    private readonly name;
    private _next: Logger;
    private _previous: Logger;

    protected constructor(name: string)
    {
        this.name = name;
    }

    public abstract handle(message: Message): boolean;

    protected abstract async work(message: Message): Promise<void>;

    public addLogger(logger: Logger): Logger
    {
        let lastLogger: Logger = this;
        while (lastLogger.next != null)
        {
            lastLogger = lastLogger.next;
        }
        lastLogger.next = logger;
        logger.previous = lastLogger;
        return this;
    }

    public disconnect(): Logger
    {
        if (this.previous)
        {
            this.previous.next = this.next;
        }
        if (this.next)
        {
            this.next.previous = this.previous;
        }
        return this;
    }

    public get next(): Logger { return this._next; }

    public set next(value: Logger) { this._next = value; }

    public get previous(): Logger { return this._previous; }

    public set previous(value: Logger) { this._previous = value; }

    protected logCommand(command: Command): void
    {
        command.addListener("end", () =>
        {
            this.disconnect();
            console.log(`successfully disconnected ${this.name}`);
        });
    }
}