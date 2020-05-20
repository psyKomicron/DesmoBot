import { VoteCommand } from "../VoteCommand";

export class VoteLogger
{
    private static votes: Map<number, VoteCommand> = new Map();

    private constructor() { }

    public static log(vote: VoteCommand): number
    {
        // hash title to get id
        let hashAdrr = VoteLogger.hash(vote.title);
        this.votes.set(hashAdrr, vote);
        return hashAdrr;
    }

    public static end(key: number): void
    {
        let vote = this.votes.get(key);
        if (vote) vote.end("user input");
        else throw new RangeError("Cannot find key in vote map");
    }

    public static hash(value: string): number
    {
        let hashAddr = 0;
        for (let counter = 0; counter < value.length; counter++)
        {
            hashAddr = value.charCodeAt(counter) + (hashAddr << 6) + (hashAddr << 16) - hashAddr;
        }
        return hashAddr;
    }
}