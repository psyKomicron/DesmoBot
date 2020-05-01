import { LoadingEffect } from './LoadingEffect';

export class StarEffect extends LoadingEffect
{
    public constructor(title: string = "", position: [number, number] = [0, 0])
    {
        super(title, ["|", "/", "-", "\\"], 200, position);
    }
}