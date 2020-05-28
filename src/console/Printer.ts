import readline = require('readline');
import { Command } from '../bot/commands/Command';

export class Printer
{
    public static startUp(): void
    {
        this.printEscCode(EscapeCodes.CLEAR_SCREEN);
        this.printEscCode(EscapeCodes.HIDE_CURSOR);
        readline.cursorTo(process.stdout, 0, 0);
        process.stdout.write(this.appTitle());
    }

    private static appTitle(): string
    {
        let str = Printer.error("-------------------------------------\n");
        str += `${Printer.error(">>>>>")} Desmo Bot with TypeScript ${Printer.error("<<<<<")}\n`;
        str += `${Printer.error(">>>>>")}                           ${Printer.error("<<<<<")}
${Printer.error("-------------------------------------")}`;
        return str;
    }

    public static print(content: string, position: [number, number])
    {
        readline.moveCursor(process.stdout, position[0], position[1]);
        console.log(content);
    }

    public static clearPrint(content: string, position: [number, number])
    {
        readline.moveCursor(process.stdout, position[0], position[1]);
        readline.clearLine(process.stdout, 0);
        console.log(content);
    }

    /**
     * Returns a string with dashes around
     * @param content
     */
    public static title(content: string | number)
    {
        if (Command.commands > 10)
        {
            this.printEscCode(EscapeCodes.CLEAR_SCREEN);
            readline.cursorTo(process.stdout, 0, 0);
        }
        let tac: string = "";
        let max = 15 - (content.toString().length / 2);
        for (let i = 0; i < max; i++) tac += "-";
        return `${tac}  ${content}  ${tac}`;
    }

    /**
     * Returns a formatted string to display command arguments
     * @param contents
     * @param values
     */
    public static args(contents: string[], values: string[], inline: boolean = false): string
    {
        if (contents.length == values.length)
        {
            let maxLength = -1;
            for (let i = 0; i < contents.length; i++)
            {
                if (contents[i].length > maxLength) maxLength = contents[i].length;
            }
            maxLength += 4;
            let lines = "";
            for (let i = 0; i < contents.length; i++)
            {
                let arg = "(-) " + contents[i];
                while (arg.length < maxLength) arg += " ";
                if (i != contents.length - 1)
                {
                    if (inline && i % 3 != 0)
                    {
                        arg += ` : ${Printer.printName(values[i])} `;
                    }
                    else
                    {
                        arg += ` : ${Printer.printName(values[i])} \n`;
                    }
                }
                else
                {
                    arg += ` : ${Printer.printName(values[i])}`;
                }
                lines += arg;
            }
            return lines;
        }
        else
        {
            console.error(Printer.error("Contents & values not the same size !"));
            return "";
        }
    }

    public static info(content: string | number): string
    {
        return this.pGreen(`${content}`);
    }

    /**
     * Return string in warning color
     * @param content
     */
    public static warn(content: string | number): string
    {
        return this.pYell(`${content}`);
    }

    /**
     * Returns string in error color.
     * @param content
     */
    public static error(content: string): string
    {
        return this.pRed(content);
    }

    public static hideCursor(): void
    {
        this.printEscCode(EscapeCodes.HIDE_CURSOR);
    }

    public static saveCursor(): void
    {
        this.printEscCode(EscapeCodes.SAVE_CURSOR);
    }

    public static restoreCursor(): void
    {
        this.printEscCode(EscapeCodes.RESTORE_CURSOR);
    }

    public static clear(): void
    {
        this.printEscCode(EscapeCodes.CLEAR_SCREEN);
        readline.cursorTo(process.stdout, 0, 0);
    }

    public static normal(content: string | number): string
    {
        return `${content}`;
    }

    private static pRed(content: string): string
    {
        return this.printColor(content, Colors.RED);
    }
    private static pGreen(content: string): string
    {
        return this.printColor(content, Colors.GREEN);
    }
    private static pBlue(content: string): string
    {
        return this.printColor(content, Colors.BLUE);
    }
    private static pYell(content: string): string
    {
        return this.printColor(content, Colors.YELLOW);
    }
    private static pPurp(content: string): string
    {
        return this.printColor(content, Colors.PURPLE);
    }
    private static pCyan(content: string): string
    {
        return this.printColor(content, Colors.CYAN);
    }
    private static pWhite(content: string): string
    {
        return this.printColor(content, Colors.WHITE);
    }
    private static pBlack(content: string): string
    {
        return this.printColor(content, Colors.BLACK);
    }
    private static printColor(content: string, color: Colors): string
    {
        return color + content + Colors.RESET;
    }
    private static printEscCode(code: EscapeCodes)
    {
        process.stdout.write(code);
    }
    private static printName(name: string)
    {
        if (name.length > 25)
        {
            let firstName = "";
            for (var i = 0; i < 10; i++)
            {
                firstName += name.charAt(i);
            }
            firstName += "[...]";
            let endName = "";
            for (var j = name.length - 10; j < name.length; j++)
            {
                endName += name.charAt(j);
            }
            return firstName + endName;
        }
        else
        {
            return name;
        }
    }
}

enum EscapeCodes
{
    SAVE_CURSOR = "\u001B[s",
    RESTORE_CURSOR = "\u001B[u",
    HIDE_CURSOR = "\u001B[?25l",
    CLEAR_SCREEN = "\u001B[1J",
    CLEAR_SCREEN_R = "\u001B[3J",
}

enum Colors
{
    RESET = "\u001B[0m",
    RED = "\u001B[1;31m",
    GREEN = "\u001B[32m",
    BLUE = "\u001B[34m",
    YELLOW = "\u001B[33m",
    PURPLE = "\u001B[35m",
    CYAN = "\u001B[36m",
    WHITE = "\u001B[37m",
    BLACK = "\u001B[30m",
}