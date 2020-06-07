import request = require('request');
import { FileSystem as fs } from '../bot/dal/Readers';
import { ProgressBar } from '../console/effects/ProgressBar';

export class Downloader
{
    private readonly _path: string;

    public constructor(directory: string)
    {
        if (directory != "." && directory != "..")
        {
            this._path = `./files/downloads/${directory}/`;
            if (!fs.exists(this.path))
            {
                fs.mkdir(this.path, true);
            }
        }
    }

    public async download(urls: Array<string>): Promise<void>
    {
        let names = new Array<string>();
        for (var j = 0; j < urls.length; j++)
        {
            names.push(Downloader.getFileName(urls[j]));
        }
        names = this.renameFiles(names);
        let bar = new ProgressBar(urls.length, "downloading");
        bar.start();
        for (var i = 0; i < urls.length; i++)
        {
            if (urls[i] == undefined)
            {
                throw new Error("url at index " + i + "was undefined");
            }
            let path = this.path + names[i];
            let file = fs.createWriteStream(path, { flags: "w" });
            bar.update(i + 1);
            let req = request.get(urls[i]);
            req.on("response", (response) =>
            {
                if (response.statusCode > 300 && response.statusCode < 600)
                {
                    let code = response.statusCode;
                    console.log(`${urls[i]}`);
                    switch (code)
                    {
                        case 400:
                            console.log(`[${code}] Bad Request !`);
                            break;
                        case 403:
                            console.log(`[${code}] Forbidden !`);
                            break;
                        case 409:
                            console.log(`[${code}] Conflict !`);
                            break;
                        case 401:
                            console.log(`[${code}] Unauthorized !`);
                            break;
                        case 404:
                            console.log(`[${code}] Not Found !`);
                            break;
                        case 500:
                            console.log(`[${code}] Internal Server Error !`);
                            break;
                        default:
                            console.log(code);
                    }
                }
            });

            req.on("error", err =>
            {
                console.error(names[i] + " " + err);
                fs.appendFile(`${this.path}/0_logs.txt`, names[i] + " -> error ");
                fs.unlink(path);
            });

            req.pipe(file);

            file.on("finish", () =>
            {
                file.close();
            });
            file.on("error", err =>
            {
                fs.unlink(path);
                throw err;
            });
        }
        bar.stop();
        let downloadedItems = "";
        urls.forEach(url =>
        {
            downloadedItems += url + "\n";
        });
        fs.appendFile(this.path + "0_logs.txt", `${downloadedItems}\n`)
    }

    private renameFiles(names: Array<string>): Array<string>
    {
        let map = new Map<string, boolean>();
        for (var i = 0; i < names.length; i++)
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
                let n = 1;
                while (map.get(current_name + ext)) // change the name
                {
                    let temp_name = current_name;
                    temp_name += `(${n})`;
                    if (!map.get(temp_name + ext))
                        current_name = temp_name;
                   n++;
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