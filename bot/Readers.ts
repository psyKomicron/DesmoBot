import fs = require('fs');

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
        let res = fs.readFileSync("./bot/emojis/" + name, "UTF-8");
        return res;
    }
}