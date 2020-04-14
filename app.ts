console.log("stdout.isTTY " + process.stdout.isTTY);
console.log('Desmo Bot with TypeScript');
import { Bot } from "./bot/Bot";
try
{
    new Bot();
} catch (e)
{
    console.log(e);
}