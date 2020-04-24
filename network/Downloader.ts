import fs = require('fs');
import readline = require('readline');
import request = require('request');
import { Printer as P }  from '../bot/Printer';

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
        for (let i = 0; i < urls.length; i++)
        {
            if (i > 0)
            {
                readline.moveCursor(process.stdout, 0, -1);
                readline.clearLine(process.stdout, 0);
            }
            let path = this.path + names[i];
            let file = await fs.createWriteStream(path);
            process.stdout.write(`${this.path} <<< ${this.printName(names[i])}\n`);
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
        console.log("wrote results into" + P.info(this.path + "/urls.txt"));
        return "completed";
    }

    private renameFiles(names: Array<string>): Array<string>
    {
        let nuples: number = 0;
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
                if (nuples > 0)
                {
                    readline.moveCursor(process.stdout, 0, -2);
                    readline.clearLine(process.stdout, 0);
                    readline.moveCursor(process.stdout, 0, 1);
                    readline.clearLine(process.stdout, 0);
                    readline.moveCursor(process.stdout, 0, -1);
                }
                process.stdout.write("colliding names : " + P.warn(nuples + 1) + "\n");
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
                process.stdout.write(P.normal(this.printName(old_name) + P.info(" >>> ") + this.printName(current_name) + ext) + "\n");
                map.set(current_name + ext, true);
                ++nuples;
            }
        }
        console.log(P.warn("\nfound " + nuples + " files with the same name"));
        let array = new Array<string>();
        map.forEach((v, k) =>
        {
            array.push(k);
        });
        if (nuples > 0) console.log(P.info("\tfiles renamed to prevent overwriting"));
        return array;
    }

    private printName(name: string): string
    {
        let res: string;
        if (name.length > 10)
        {
            res = name.substr(0, 10);
            res += "[...]." + name.split(".")[name.split(".").length - 1];
        }
        else res = name;
        return res;
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