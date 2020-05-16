import { Command } from "../commands/Command";

export abstract class CustomException extends Error
{
    protected constructor(message, name: Command)
    {
        super(message);
        this.name = name.Name;
    }
}