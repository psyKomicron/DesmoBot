import { Logger } from "../Logger";
import { Message } from "discord.js";
import { Printer } from "../../../../console/Printer";

export class DefaultLogger extends Logger
{
    public handle(message: Message): boolean 
    {
        if (this.next)
        {
            console.log(Printer.title("handlers"));
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