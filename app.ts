// necessary imports
import { Bot } from "./src/bot/Bot";
import { Printer } from "./src/console/Printer";
import { StarEffect } from "./src/console/effects/StarEffect";
// end necessary imports

// ------- Tests --------
// new WebServer().startService();
// -------- Code --------
Printer.startUp();
let loadingEffect = new StarEffect("", [-17, -1]);
let id = loadingEffect.start();
try
{
    new Bot(id);
} catch (e)
{
    console.log(e);
}