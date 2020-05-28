import { Message } from "discord.js";

export abstract class Logger
{
    private _next: Logger;
    private _previous: Logger;

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

    protected get next(): Logger { return this._next; }

    protected set next(value: Logger) { this._next = value; }

    protected get previous(): Logger { return this._previous; }

    protected set previous(value: Logger) { this._previous = value; }
}