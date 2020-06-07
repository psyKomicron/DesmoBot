import { CustomError } from "../CustomError";
import { YoutubeModule } from "../../commands/commands/explore/youtube/YoutubeModule";

export class YoutubeAPIKeyError extends CustomError
{
    public constructor(message: string, name: YoutubeModule)
    {
        super(message, name.name)
    }
}