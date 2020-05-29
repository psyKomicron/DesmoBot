import { Logger } from "../Logger";
import { Message } from "discord.js";
import { PlayCommand } from "../../commands/PlayCommand";

export class PlayLogger extends Logger 
{
    private player: PlayCommand;

    public handle(message: Message): boolean 
    {
        let can: boolean;
        if (message.content.substr(1).match(/(leave)+/g) ||
            message.content.substr(1).match(/(play)+/g) ||
            message.content.substr(1).match(/(next)+/g))
        {
            can = true;
            this.work(message);
        }

        else
        {
            if (this.next)
            {
                can = this.next.handle(message);
            }
            else
            {
                can = false;
            }
        }
        return can;
    }

    protected async work(message: Message): Promise<void> 
    {
        if (this.player.channel.guild == message.guild)
        {
            if (message.content.substr(1).match(/(leave)+/g))
            {
                this.player.disconnect();
            }
            else if (message.content.substr(1).match(/(play)+/g))
            {
                this.player.addToPlaylist(message);
            }
            else if (message.content.substr(1).match(/(next)+/g))
            {
                this.player.playNext();
            }
        }
    }

    /**
     * Can only log one player at once. Will disconnect previous player when called on the same logger.
     * @param player
     */
    public logPlayer(player: PlayCommand): PlayLogger
    {
        if (this.player)
        {
            this.player.disconnect();
            this.player = player;
        }
        else
        {
            this.player = player;
        }
        return this;
    }
}