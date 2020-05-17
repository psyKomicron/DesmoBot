import fs = require('fs');
import { Printer } from '../../console/Printer';

export class TokenReader
{
    public static getToken(): string 
    {
        let str = "";
        try {
            str = fs.readFileSync("./node_modules/token.txt", "UTF-8");
        } catch (e) {
            console.log(e);
            str = "";
        }
        return str;
    }
}

export class EmojiReader
{
    public static getEmoji(name: string): string
    {
        let res = undefined;
        try
        {
            res = fs.readFileSync("./src/bot/emojis/" + name, "UTF-8");
        }
        catch (error)
        {
            if ((error as Error).name == "EONENT")
                console.log(Printer.error(`Cannot find emoji ${name}, maybe it was deleted or hasn't been created`));
            else
                console.error(Printer.error((error as Error).message));
        }
        return res;
    }
}

export class FileSystem
{
    public static readFile(path: string): Buffer
    {
        return fs.readFileSync(path);
    }

    public static appendToFile(path: string, content: string): void
    {
        fs.appendFileSync(path, content);
    }

    public static writeFile(path: string, content: string): void
    {
        fs.writeFileSync(path, content);
    }

    public static exists(path): boolean
    {
        return fs.existsSync(path);
    }

    public static mkdir(path: string, recursive = false): string
    {
        return fs.mkdirSync(path, { recursive: recursive });
    }

    public static rmdir(path: string): void
    {
        fs.rmdirSync(path);
    }

    public static unlink(path: string): void
    {
        fs.unlinkSync(path);
    }

    public static getStats(path: string): fs.Stats
    {
        return fs.statSync(path);
    }
}