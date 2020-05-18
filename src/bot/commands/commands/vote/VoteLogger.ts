import { VoteCommand } from "../VoteCommand";

export class VoteLogger
{
    private static votes: Map<number, VoteCommand> = new Map();

    private constructor() { }

    public static log(vote: VoteCommand): number
    {
        let name = vote.title;
        // hash title to get id
        let hashAdrr = 0;
        for (let counter = 0; counter < name.length; counter++)
        {
            hashAdrr = name.charCodeAt(counter) + (hashAdrr << 6) + (hashAdrr << 16) - hashAdrr;
        }
        this.votes.set(hashAdrr, vote);
        return hashAdrr;
    }

    public static end(key: number): void
    {
        let vote = this.votes.get(key);
        if (vote) vote.end("user input");
        else throw new RangeError("Cannot find key in vote map");
    }
}