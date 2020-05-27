import { Explorer } from "./Explorer";
import { EmbedFactory } from '../../factory/EmbedFactory';
import { DiscordAPIError } from 'discord.js';
import { Printer } from '../../../../console/Printer';

export class WikiExplorer extends Explorer
{
    public async explore(): Promise<void> 
    {
        let res = await this.getHTML(this.urlize(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=`, this.keyword, "%20"));
        let map = this.parseRes(res);
        let embed = EmbedFactory.build({
            color: Math.floor(Math.random() * 16777215),
            description: `Search for "${this.keyword}"`,
            footer: "Powered by Julie",
            title: "Wikipedia"
        });
        map.forEach((snippet, title) =>
        {
            if (title != "totalhits")
            {
                embed.addField(title, snippet + "[...]");
            }
            else
            {
                embed.addField("Total hits", snippet);
            }
        });
        try
        {
            embed.setURL(this.urlize(`https://en.wikipedia.org/wiki/`, embed.fields[1].name, "_"));
        } catch (error)
        {
            if (!(error instanceof DiscordAPIError))
            {
                console.error(error);
            }
        }
        this.send(embed);
    }

    private parseRes(res: string): Map<string, string>
    {
        let map = new Map<string, string>();
        try
        {
            let obj = JSON.parse(res);
            // get query
            let query = obj["query"];
            let totalhits = query["searchinfo"]["totalhits"];
            map.set("totalhits", totalhits);
            for (let propName in query)
            {
                if (propName == "search")
                {
                    let prop = query[propName];
                    for (var i = 0; i < prop.length; i++)
                    {
                        let result = prop[i];
                        let title = result["title"];
                        let snippet = result["snippet"];
                        // clean snippet from html
                        if (title && snippet)
                        {
                            map.set(title, this.removeHTML(snippet));
                        }
                    }
                }
            }
        } catch (error)
        {
            if (error instanceof Error)
            {
                console.error(Printer.error(error.name) + "\n" + error.message);
            }
            else console.error(error);
        }
        return map;
    }

    private removeHTML(html: string): string
    {
        let text = "";
        for (var i = 0; i < html.length; i++)
        {
            if (html.charAt(i) == '<')
            {
                let j = i;
                while (html.charAt(j) != '>')
                {
                    j++;
                }
                i = j;
            }
            else text += html.charAt(i);
        }
        return text;
    }
}