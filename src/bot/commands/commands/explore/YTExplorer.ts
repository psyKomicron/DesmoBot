import { Explorer } from "./Explorer";
import { Printer } from '../../../../console/Printer';
import { EmbedFactory } from '../../factory/EmbedFactory';
import { YoutubeModule } from './youtube/YoutubeModule';
import { TokenReader } from '../../../dal/Readers';
import { YoutubeAPIKeyError } from "../../../errors/customs/YoutubeAPIKeyError";

export class YTExplorer extends Explorer
{
    public async explore(): Promise<void> 
    {
        try
        {
            let ytModule = new YoutubeModule(TokenReader.getYoutubeAPIKey());
            console.log(Printer.info("Sucessfully created youtube data API client"));

            ytModule.searchVideos(this.keyword, 10, "en")
                .then(res =>
                {
                    let embed = EmbedFactory.build({
                        title: "Youtube",
                        color: Math.floor(Math.random() * 16777215),
                        description: `Youtube search for \`${this.keyword}\``,
                        footer: "made by Julie"
                    });
                    for (var i = 0; i < 10; i++)
                    {
                        let item = res.items[i];
                        let name = "**" + item.title + "**";
                        let value = item.videoURL;
                        if (name && value)
                        {
                            embed.addField(name, value);
                        }
                    }
                    embed.setURL(res.items[0].videoURL);
                    this.send(embed);
                })
                .catch(console.error);
        } catch (e)
        {
            if (e instanceof YoutubeAPIKeyError)
            {
                console.log(Printer.error("Error occured while searching for youtube videos"));
                console.error(e.message);
            }
        }
    }
    
}