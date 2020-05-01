import readline = require('readline');
import { Printer } from '../Printer';

export abstract class LoadingEffect
{
    private speed: number;
    private title: string;
    private effectLength: number;
    private effects: string[];
    private timeout: NodeJS.Timeout;
    private position: [number, number];

    /**
     * 
     * @param title Title to print before the effect, can be set empty
     * @param effects Array of strings representing each frame of the effect
     * @param speed Interval between each "frame"
     * @param position Position of the effect in the console
     */
    public constructor(title: string, effects: string[], speed: number, position: [number, number])
    {
        this.title = title;
        this.effects = effects;
        this.effectLength = effects[0].length;
        this.speed = speed;
        this.position = position;
    }

    public start(): NodeJS.Timeout
    {
        if (this.title != "")
            console.log(this.title);
        let size = this.effects.length;
        readline.moveCursor(process.stdout, this.position[0], this.position[1]);
        let i = 0;
        this.timeout = setInterval(() =>
        {
            readline.moveCursor(process.stdout, -this.effectLength, 0);
            process.stdout.write(Printer.normal(this.effects[i % size]));
            i++;
        }, this.speed);
        return this.timeout;
    }

    public stop(): void
    {
        clearInterval(this.timeout);
    }
}