// necessary imports
import { Bot } from "./bot/Bot";
import { StarEffect } from "./ui/effects/StarEffect";
import { Printer } from "./ui/Printer";
// end necessary imports
import fs = require('fs');

// ------- Tests --------

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