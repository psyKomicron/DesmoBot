import { Logger } from "../Logger";
import { Message } from "discord.js";

export class DefaultLogger extends Logger
{
    public constructor()
    {
        super("default-logger");
    }

    public handle(message: Message): boolean 
    {
        if (this.next)
        {
            return this.next.handle(message);
        }
        else
        {
            return false;
        }
    }

    public async work(message: Message): Promise<void>
    {
        throw new Error("Cannot be called on default logger");
    }
}