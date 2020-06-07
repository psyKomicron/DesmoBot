import { CustomError } from "../CustomError";
import { Command } from "../../commands/Command";

export class WrongArgumentError extends CustomError
{
    public constructor(command: Command, message = "Wrong argument")
    {
        super(message, command.name);
    }
}