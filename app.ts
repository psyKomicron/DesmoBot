import { Bot } from "./bot/Bot";
import { Printer } from "./bot/ui/Printer";
import readline = require('readline');
import { ProgressBar } from "./bot/ui/ProgressBar";
import { exit } from "process";

process.stdout.write("\u001B[?25l");
// -------- Code --------
console.log(Printer.error("-------------------------------------"));
console.log(`${Printer.error(">>>>>")} Desmo Bot with TypeScript ${Printer.error("<<<<<")}`); // 59
process.stdout.write(
`${Printer.error(">>>>>")}                           ${Printer.error("<<<<<")} 
${Printer.error("-------------------------------------")}`);

let wait = ["|", "/", "-", "\\"];
readline.moveCursor(process.stdout, -17, -1);
let i = 0;
let id = setInterval(() =>
{
    readline.moveCursor(process.stdout, -1, 0);
    process.stdout.write(Printer.error(wait[i % 4]));
    i++;
}, 200);

try
{
    new Bot(id);
} catch (e)
{
    console.log(e);
}