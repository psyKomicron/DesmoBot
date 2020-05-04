import fs = require('fs');
import express = require('express');
import { Printer } from '../Printer';

export class WebServer
{
    private timeout: number;

    public constructor(timeout: number = 60)
    {
        this.timeout = timeout * 1000;
    }

    public startService(): void
    {
        var app = express();
        app.get("/", (req, res) =>
        {
            res.setHeader("Content-Type", "text/plain");
            res.send("bite");
        });
        app.listen(9001);
        console.log(Printer.info("Server running : localhost:9001"));
    }
}

/**Reads the html file used to download files */
class HTMLReader
{
    private imagesPaths: Array<string>;

    public constructor()
    {
        this.imagesPaths = this.loadImages();
    }

    public get get(): string
    {
        let file = fs.readFileSync("./files/index.html");
        // parse html & add images
        return file.toString();
    }

    private loadImages(path: string = "./files/downloads/"): Array<string>
    {
        const directory = path;
        let directories = new Array<string>();
        fs.readdirSync(directory).forEach(dir =>
        {
            try
            {
                fs.accessSync(directory + dir);
                let path = `${directory}${dir}/`;

                if (fs.lstatSync(path).isDirectory())
                {
                    this.loadImages(path).forEach(value =>
                    {
                        directories.push(value);
                    });
                }
                else
                    directories.push(dir);
            } catch (e)
            {
                console.log(Printer.error(`Directory ${directory}${dir} does not exists`));
            }
        });
        return directories;
    }
}