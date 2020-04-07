import fs = require('fs');

export class TokenReader
{
    getToken(): string {
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