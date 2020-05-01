import fs = require('fs');
import readline = require('readline');
import http = require('http');
import { Printer } from '../Printer';

export class WebServer
{
    private timeout: number;
    private server: http.Server;

    public constructor(timeout: number = 60)
    {
        this.timeout = timeout * 1000;
    }

    public startService(): void
    {
        console.log("Server running : localhost:9001");
        this.server = http.createServer((req, res) =>
        {
            res.writeHead(200);
            res.end(new HTMLReader().get);
        });
        this.server.listen(9001);
        setTimeout(() =>
        {
            this.stopService();
        }, this.timeout);
    }

    private stopService()
    {
        console.log(Printer.info("Closing server"));
        readline.moveCursor(process.stdout, 0, -1);
        this.server.close();1
    }
}

/**Reads the html file used to download files */
class HTMLReader
{
    public get get(): string
    {
        let file = fs.readFileSync("./files/index.html");
        return file.toString();
    }
}