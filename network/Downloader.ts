import fs = require('fs');
import request = require('request');
import Discord = require('discord.js');

export class Downloader
{
    public download(url: string, filepath: string)
    {
        let path = filepath + Downloader.getFileName(url);
        let file = fs.createWriteStream(path);
        let req = request.get(url);
        req.on("response", (response) =>
        {
            if (response.statusCode !== 200) console.error("status code not 200");
        });

        req.on("error", err =>
        {
            console.error(err);
            fs.unlinkSync(path);
        });

        req.pipe(file);

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

    public static getFileName(url: string): string
    {
        let substr = url.split("/");
        return substr[substr.length - 1];
    }
}