import cheerio = require('cheerio');
import { Explorer } from "./Explorer";
import { ExploreCommand } from '../ExploreCommand';
import { EmbedFactory } from '../../factory/EmbedFactory';

export class WikiExplorer extends Explorer
{
    public async explore(): Promise<void> 
    {
        let html = await this.getHTML();
        var $ = cheerio.load(html);
        // get fields
        let title = cheerio.text($('.firstHeading'));
        let desc: string = cheerio.text($('p'));
        desc = desc.substr(0, 1000);
        let object = {
            embed: {
                "color": Math.floor(Math.random() * 16777215),
                "description": desc,
                "footer": "Powered by Julie",
                "title": `${title}`
            }
        }
        let embed = EmbedFactory.build(object)
        try
        {
            embed.setURL(this.url);
        } catch (error) {console.error(error)}
        this.send(embed);
    }

    public aaa()
    {
        const api = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=`
        //let url = api + this.
    }
}