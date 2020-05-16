import { CustomException } from "../CustomException";
import { Command } from "../../commands/Command";

export class WrongArgumentException extends CustomException
{
    public constructor(command: Command, message = "Wrong argument")
    {
        super(message, command);
    }
}