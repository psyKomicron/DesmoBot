import { Bot } from "./bot/Bot";
import { Printer } from "./bot/Printer";

console.log("stdout.isTTY " + process.stdout.isTTY);
console.log('>>> Desmo Bot with TypeScript <<<');

try
{
    new Bot();
} catch (e)
{
    console.log(e);
}