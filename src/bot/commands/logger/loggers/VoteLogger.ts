import { VoteCommand } from "../../commands/VoteCommand";
import { Logger } from "../Logger";
import { Message } from "discord.js";
import { EmojiReader } from "../../../dal/Readers";

export class VoteLogger extends Logger
{
    private vote: VoteCommand;
    private voteID: number;

    public handle(message: Message): boolean 
    {
        let can: boolean;
        let split = message.content.split(" ");
        if (message.content.substr(1, 3) == "end" && split.length > 0 && split[1] == `${this.voteID}`)
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
        let content = message.content;
        let index = content.split(" ")[1];
        if (!Number.isNaN(Number.parseInt(index)))
        {
            try 
            {
                this.end(Number.parseInt(index));
            } catch (error) 
            {
                if (error instanceof RangeError)
                {
                    message.react(EmojiReader.getEmoji("red_cross"));
                    console.error(error.message);
                }
            }
        }
        if (message.deletable)
        {
            message.delete({ timeout: 5000 });
        }
    }

    public logVote(vote: VoteCommand): number
    {
        let id = this.hash(vote.title);
        this.vote = vote;
        this.voteID = id;
        return id;
    }

    /**
     * Ends the vote whose id match the key given.
     * @throws If the @key does not match with a vote
     * @param key Id of a vote
     */
    private end(key: number): void
    {
        this.vote.end("User input");
    }

    /**
     * Hash a string using sdbm hash algorithm
     * @param value Value to hash
     */
    private hash(value: string): number
    {
        let hashAddr = 0;
        for (let counter = 0; counter < value.length; counter++)
        {
            hashAddr = value.charCodeAt(counter) + (hashAddr << 6) + (hashAddr << 16) - hashAddr;
        }
        return hashAddr;
    }
}