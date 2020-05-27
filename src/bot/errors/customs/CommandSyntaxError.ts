import { CustomError } from "../CustomError";
import { Command } from "../../commands/Command";

export class CommandSyntaxError extends CustomError
{
    public constructor(command: Command)
    {
        super("Syntax error in the command", command.name);
    }
}