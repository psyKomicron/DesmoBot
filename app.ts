import fs = require('fs');
import { Bot } from "./bot/Bot";
import { WebServer } from "./ui/web/WebServer";
import { StarEffect } from "./ui/effects/StarEffect";
import { Printer } from "./ui/Printer";
import { exit } from "process";

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