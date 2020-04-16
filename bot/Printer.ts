export class Printer
{
    /**
     * Returns console printable in default color
     * @param content
     */
    public static normal(content: string | number): string
    {
        return `${content}`;
    }

    /**
     * Return console printable in info color
     * @param content
     */
    public static info(content: string | number): string
    {
        return this.pGreen(`${content}`);
    }

    /**
     * Return console printable in warning color
     * @param content
     */
    public static warn(content: string | number): string
    {
        return this.pYell(`${content}`);
    }

    /**
     * Returns console printable in error color.
     * @param content
     */
    public static error(content: string): string
    {
        return this.pRed(content);
    }

    /**
     * Returns a red console printable string
     * @param content
     */
    private static pRed(content: string): string
    {
        return this.printColor(content, Colors.RED);
    }

    /**
     * Returns a green console printable string
     * @param content
     */
    private static pGreen(content: string): string
    {
        return this.printColor(content, Colors.GREEN);
    }

    /**
     * Returns a blue console printable string
     * @param content
     */
    private static pBlue(content: string): string
    {
        return this.printColor(content, Colors.BLUE);
    }

    /**
     * Returns a yellow console printable string
     * @param content
     */
    private static pYell(content: string): string
    {
        return this.printColor(content, Colors.YELLOW);
    }

    /**
     * Returns a purple console printable string
     * @param content
     */
    private static pPurp(content: string): string
    {
        return this.printColor(content, Colors.PURPLE);
    }

    /**
     * Returns a cyan console printable string
     * @param content
     */
    private static pCyan(content: string): string
    {
        return this.printColor(content, Colors.CYAN);
    }

    /**
     * Returns a white console printable string
     * @param content
     */
    private static pWhite(content: string): string
    {
        return this.printColor(content, Colors.WHITE);
    }

    /**
     * Returns a black console printable string
     * @param content
     */
    private static pBlack(content: string): string
    {
        return this.printColor(content, Colors.BLACK);
    }

    /**
     * Returns a console printable string with the specified
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