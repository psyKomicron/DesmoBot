import fs = require('fs');
import readline = require('readline');
import request = require('request');
import { Printer as P }  from '../bot/ui/Printer';
import { ProgressBar } from '../ui/web/effects/ProgressBar';

export class Downloader
{
    private _path: string;

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
                if (response.statusCode !== 200) console.error(P.error(`status code is ${response.statusCode}`));
            });

            req.on("error", err =>
            {
                console.error(`${P.error(names[i])} -> ${err})`);
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
        console.log("wrote results into " + this.path + "logs.txt");
        return "completed";
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
    public set path(value: string)
    {
        this._path = value;
    }

    public static getFileName(url: string): string
    {
        let substr = url.split("/");
        return substr[substr.length - 1];
    }
}