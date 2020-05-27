import { Command } from "../commands/Command";

export abstract class CustomError extends Error
{
    protected constructor(message, name: string)
    {
        super(message);
        this.name = name;
    }
}