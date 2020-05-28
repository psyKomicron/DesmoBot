import { Logger } from "../Logger";
import { Message } from "discord.js";
import { PlayCommand } from "../../commands/PlayCommand";

export class PlayLogger extends Logger 
{
    private player: PlayCommand;

    public handle(message: Message): boolean 
    {
        let can: boolean;
        if (message.content.substr(1).match(/(leave)+/g))
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
            this.player.disconnect();
        }
    }

    /**
     * Can only log one player at once. Will disconnect previous player when called.
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