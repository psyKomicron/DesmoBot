import { LoadingEffect } from './LoadingEffect';

export class BubbleEffect extends LoadingEffect
{
    public constructor(title: string)
    {
        super(title, ["Ooo", "oOo", "ooO"], 300, [0, 0]);
    }
}