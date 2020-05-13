import fs = require('fs');
import request = require('request');
import { Printer } from '../console/Printer';
import { ProgressBar } from '../console/effects/ProgressBar';

export class Downloader
{
    private readonly _path: string;

    public constructor(directory: string)
    {
        if (directory != "." && directory != "..")
        {
            this._path = `./files/downloads/${directory}/`;
            if (!fs.existsSync(this.path))
            {
                fs.mkdirSync(this.path, { recursive: true });
            }
        }
    }

    public async download(urls: Array<string>): Promise<string>
    {
        let names = new Array<string>();
        for (let i = 0; i < urls.length; i++)
        {
            names.push(Downloader.getFileName(urls[i]));
        }
        names = this.renameFiles(names);
        let bar = new ProgressBar(urls.length, "downloading");
        bar.start();
        for (let i = 0; i < urls.length; i++)
        {
            let path = this.path + names[i];
            let file = await fs.createWriteStream(path);
            bar.update(i + 1);
            let req = await request.get(urls[i]);
            req.on("response", (response) =>
            {
                if (response.statusCode !== 200) console.error(Printer.error(`status code is ${response.statusCode}`));
            });

            req.on("error", err =>
            {
                console.error(`${Printer.error(names[i])} -> ${err})`);
                fs.appendFileSync(`${this.path}/logs.txt`, names[i] + " -> error ");
                fs.unlinkSync(path);
            });

            await req.pipe(file);

            file.on("finish", () =>
            {
                file.close();
            });
            file.on("error", err =>
            {
                fs.unlinkSync(path);
                throw err;
            });
        }
        urls.forEach(url =>
        {
            fs.appendFileSync(this.path + "logs.txt", `${url}\n`);
        });
        return "wrote results into " + this.path + "logs.txt";
    }

    private renameFiles(names: Array<string>): Array<string>
    {
        let map = new Map<string, boolean>();
        for (let i = 0; i < names.length; i++)
        {
            if (!map.get(names[i]))
            {
                map.set(names[i], true);
            }
            else
            {
                let old_name = names[i];
                let current_name = old_name.split(".")[0];
                let ext = "." + old_name.split(".")[1];
                let n: number = 1;
                while (map.get(current_name + ext)) // change the name
                {
                    let temp_name = current_name;
                    temp_name += `(${n})`;
                    if (!map.get(temp_name + ext))
                        current_name = temp_name;
                    ++n;
                }
                map.set(current_name + ext, true);
            }
        }
        let array = new Array<string>();
        map.forEach((v, k) =>
        {
            array.push(k);
        });
        return array;
    }

    public get path(): string
    {
        return this._path;
    }

    public static getFileName(url: string): string
    {
        let substr = url.split("/");
        return substr[substr.length - 1];
    }
}