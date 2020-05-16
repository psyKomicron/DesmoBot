import { VoteCommand } from "./VoteCommand";

export class VoteLogger
{
    private static votes: Array<VoteCommand> = new Array();

    private constructor() { }

    public static log(vote: VoteCommand): number
    {
        return this.votes.push(vote) - 1;
    }

    public static end(index: number): void
    {
        if (index < this.votes.length)
        {
            this.votes[index].end("user input");
        }
    }
}