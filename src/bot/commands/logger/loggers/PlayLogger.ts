import { Logger } from "../Logger";
import { Message } from "discord.js";
import { PlayCommand } from "../../commands/PlayCommand";
import { Printer } from "../../../../console/Printer";

export class PlayLogger extends Logger 
{
    private player: PlayCommand;

    public constructor()
    {
        super("play-logger");
    }

    public handle(message: Message): boolean 
    {
        let can: boolean;
        if (message.content.substr(1).match(/(leave)+/g) ||
            message.content.substr(1).match(/(play)+/g) ||
            message.content.substr(1).match(/(next)+/g) ||
            message.content.substr(1).match(/(pause)+/g) ||
            message.content.substr(1).match(/(resume)+/g))
        {
            can = true;
            console.log(Printer.title("handled by play logger"));
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
            let content = message.content;
            switch (true)
            {
                case content.substr(1).match(/(leave)+/g) != null:
                    this.player.leave();
                    console.log(Printer.info("Disconnecting play logger"));
                    this.disconnect();
                    break;
                case content.substr(1).match(/(play)+/g) != null:
                    this.player.addToPlaylist(message);
                    break;
                case content.substr(1).match(/(next)+/g) != null:
                    this.player.next();
                    break;
                case content.substr(1).match(/(pause)+/g) != null:
                    this.player.pause();
                    break;
                case content.substr(1).match(/(resume)+/g) != null:
                    this.player.resume();
                    break;
            }
        }
    }

    /**
     * Can only log one player at once. Will create and return a new Logger with the provided player.
     * @param player
     */
    public logPlayer(player: PlayCommand): PlayLogger
    {
        if (this.player)
        {
            return new PlayLogger().logPlayer(player);
        }
        else
        {
            this.player = player;
        }
        return this;
    }
}