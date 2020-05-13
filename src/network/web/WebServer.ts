import fs = require('fs');
import express = require('express');
import http = require('http');
import { Printer } from '../../console/Printer';

export class WebServer
{
    private static on: boolean;
    private timeout: number;
    private app: any;

    public constructor(timeout: number = 60)
    {
        if (WebServer.on)
        {
            throw "WebServer instance already running";
        }
        this.timeout = timeout * 1000;
    }

    public startService(): void
    {
        if (!WebServer.on)
        {
            WebServer.on = true;
            this.app = express();
            this.app.get("/", (req, res) =>
            {
                res.setHeader("Content-Type", "");
                res.render('index');
            });
            this.app.set("view engine", "pug");
            const server = http.createServer(this.app.listen(9001, () =>
            {
                console.log(Printer.info("Server running : localhost:9001"));
            }));
            server.on("close", () =>
            {
                WebServer.on = false;
                console.log("Server shutting down");
            });
            setTimeout(() => server.close(), this.timeout);
        }
        else console.log(Printer.error("Server already running..."));
    }
}

/**Reads the html file used to download files */
class HTMLReader
{
    public get get(): string
    {
        //return this.createPage(this.searchImages());
        return fs.readFileSync("./website/index.html").toLocaleString();
    }

    private createPage(imagesPaths: Array<string>): string
    {
        const workingDir = __dirname + "/imgs/";
        if (!fs.existsSync(workingDir))
            fs.mkdirSync(workingDir, { recursive: false });
        let images = new Array<string>();
        imagesPaths.forEach(path =>
        {
            try
            {
                let file = fs.readFileSync(path);
                let filename = path.split("/")[path.split("/").length - 1];
                fs.writeFileSync(workingDir + filename, file);
                images.push(filename);
            } catch (e)
            {
                if (e as Error)
                {
                    console.log(Printer.error(e.message));
                }
            }
        });
        // web page
        let page = `<!DOCTYPE html><html><style>body { font-family: sans-serif; }</style><body>`;
        images.forEach(image => page += `<img src="${workingDir + image}" height="50" width="50">`);
        page += `</body></html>`;
        return page;
    }

    /**
     * Search downloaded images & return the path to them
     * @param path Where to search the images. Used for recursion.
     */
    private searchImages(path: string = "./files/downloads/"): Array<string>
    {
        const directory = path;
        let directories = new Array<string>();
        let res = fs.readdirSync(directory);
        for (var i = 0; i < res.length; i++)
        {
            let file = res[i];
            try
            {
                fs.accessSync(directory + file);
                let filePath = `${directory}${file}`;
                if (fs.lstatSync(filePath).isDirectory())
                    this.searchImages(filePath + "/").forEach(value => directories.push(value));
                else
                    directories.push(filePath);
            } catch (e)
            {
                console.error(Printer.error(e));
            }
        }
        return directories;
    }
}