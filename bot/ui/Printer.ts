export class Printer
{

    /**
     * Returns a string with dashes around
     * @param content
     */
    public static title(content: string | number)
    {
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
    public static args(contents: string[], values: string[]): string
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
                let arg = "[+] " + contents[i];
                while (arg.length < maxLength)
                {
                    arg += " ";
                }
                if (i != contents.length - 1)
                    arg += ` : ${values[i]} \n`;
                else
                    arg += ` : ${values[i]}`;
                lines += arg;
            }
            return lines;
        }
        else
        {
            console.log(Printer.error("contents & values not the same size !"));
            return "";
        }
    }

    /**
     * Returns string in default color
     * @param content
     */
    public static normal(content: string | number): string
    {
        return `${content}`;
    }

    /**
     * Return string in info color
     * @param content
     */
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

    /**
     * Returns a red string string
     * @param content
     */
    private static pRed(content: string): string
    {
        return this.printColor(content, Colors.RED);
    }

    /**
     * Returns a green string string
     * @param content
     */
    private static pGreen(content: string): string
    {
        return this.printColor(content, Colors.GREEN);
    }

    /**
     * Returns a blue string string
     * @param content
     */
    private static pBlue(content: string): string
    {
        return this.printColor(content, Colors.BLUE);
    }

    /**
     * Returns a yellow string string
     * @param content
     */
    private static pYell(content: string): string
    {
        return this.printColor(content, Colors.YELLOW);
    }

    /**
     * Returns a purple string string
     * @param content
     */
    private static pPurp(content: string): string
    {
        return this.printColor(content, Colors.PURPLE);
    }

    /**
     * Returns a cyan string
     * @param content
     */
    private static pCyan(content: string): string
    {
        return this.printColor(content, Colors.CYAN);
    }

    /**
     * Returns a white string
     * @param content
     */
    private static pWhite(content: string): string
    {
        return this.printColor(content, Colors.WHITE);
    }

    /**
     * Returns a black string
     * @param content
     */
    private static pBlack(content: string): string
    {
        return this.printColor(content, Colors.BLACK);
    }

    /**
     * Returns a string with the specified
     * color.
     * Used by the other methods.
     * @param content string to color
     * @param color
     */
    private static printColor(content: string, color: Colors): string
    {
        return color + content + Colors.RESET;
    }
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