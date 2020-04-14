import fs = require('fs');
import readline = require('readline');
import request = require('request');

export class Downloader
{
    private _path: string;

    public async download(urls: Array<string>): Promise<string>
    {
        console.log("received " + urls.length + " urls");
        let names = new Array<string>();
        urls.forEach(url =>
        {
            names.push(Downloader.getFileName(url));
        });
        names = this.renameFiles(names);
        for (let i = 0; i < urls.length; i++)
        {
            if (i > 0)
            {
                readline.moveCursor(process.stdout, 0, -1);
                readline.clearLine(process.stdout, 0);
            }
            process.stdout.write("<<< " + names[i] + "\n");
            let path = this.path + names[i];
            let file = await fs.createWriteStream(path);
            let req = await request.get(urls[i]);
            req.on("response", (response) =>
            {
                if (response.statusCode !== 200) console.error("status code not 200");
            });

            req.on("error", err =>
            {
                console.error(names[i] + " -> " + err);
                fs.appendFileSync("url.txt", names[i] + " -> error ");
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
            fs.appendFileSync("urls.txt", url + "\n");
        });
        console.log("wrote urls into \"urls.txt\"");
        return "completed";
    }

    private renameFiles(names: Array<string>): Array<string>
    {
        let n_wins: number = 0; // n-wins -> twins = 2, n_wins = n
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
                if (n_wins > 0)
                {
                    readline.moveCursor(process.stdout, 0, -2);
                    readline.clearLine(process.stdout, 0);
                    readline.moveCursor(process.stdout, 0, 1);
                    readline.clearLine(process.stdout, 0);
                    readline.moveCursor(process.stdout, 0, -1);
                }
                process.stdout.write("colliding name : " + old_name.split(".")[0] + "\n");
                let current_name = old_name.split(".")[0];
                let ext = "." + old_name.split(".")[1];
                let n: number = 1;
                while (map.get(current_name + ext)) // change the name
                {
                    let temp_name = current_name;
                    temp_name += n;
                    if (!map.get(temp_name + ext))
                        current_name = temp_name;
                    ++n;
                }
                process.stdout.write(old_name + " >>> " + current_name + " (extension " + ext + ")" + "\n");
                map.set(current_name + ext, true);
                ++n_wins;
            }
        }
        console.log("\nfound " + n_wins + " files with the same name");
        let array = new Array<string>();
        map.forEach((v, k) =>
        {
            array.push(k);
        });
        if (n_wins > 0) console.log("all twin files renamed to prevent overwriting");
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