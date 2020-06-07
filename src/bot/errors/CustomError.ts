
export abstract class CustomError extends Error
{
    protected constructor(name: string, message: string = "")
    {
        super();
        this.name = name;
        this.message = message;
    }

    public toString(): string
    {
        return `[${this.name}] => \n\t${this.message}`;
    }
}