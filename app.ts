// necessary imports
import { Bot } from "./src/bot/Bot";
import { Printer } from "./src/ui/effects/Printer";
import { StarEffect } from "./src/ui/effects/StarEffect";
// end necessary imports
import { WebServer } from "./src/ui/web/WebServer";

// ------- Tests --------
new WebServer().startService();
// -------- Code --------
/*Printer.startUp();
let loadingEffect = new StarEffect("", [-17, -1]);
let id = loadingEffect.start();
try
{
    new Bot(id);
} catch (e)
{
    console.log(e);
}*/