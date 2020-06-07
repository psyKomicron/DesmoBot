import { CustomError } from "../CustomError";

export class DeprecatedCommandError extends CustomError 
{
    public constructor()
    {
        super("DeprecatedCommandError", "Method/Command used is considered");
    }
}