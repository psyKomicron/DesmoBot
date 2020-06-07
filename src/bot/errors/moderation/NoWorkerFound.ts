import { CustomError } from "../CustomError";

export class NoWorkerFound extends CustomError
{
    public constructor(message: string)
    {
        super("NoWorkerFound", message);
    }
}