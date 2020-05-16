import { CustomException } from "../CustomException";
import { Command } from "../../commands/Command";

export abstract class CommandSyntaxException extends CustomException
{
    public constructor(command: Command)
    {
        super("Syntax error in the command", command);
    }
}