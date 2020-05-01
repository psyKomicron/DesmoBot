import fs = require('fs');
import { Printer } from '../ui/Printer';

export class TokenReader
{
    static getToken(): string 
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
    getEmoji(name: string): string
    {
        let res = undefined;
        try
        {
            res = fs.readFileSync("./bot/emojis/" + name, "UTF-8");
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