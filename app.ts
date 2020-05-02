import fs = require('fs');
import { Bot } from "./bot/Bot";
import { WebServer } from "./ui/web/WebServer";
import { StarEffect } from "./ui/effects/StarEffect";
import { Printer } from "./ui/Printer";
import { exit } from "process";
import { Downloader } from './network/Downloader';
import { BotEmbed } from './ui/discord/BotEmbed';

// ------- Tests --------
/*let json = JSON.parse(fs.readFileSync("./files/commandlogs.json").toString());
console.log(json[0]["user"]);
while (true);*/
let json = {
    "embed": {
        "color": 12,
        "description": "Test embed",
        "fields": [
            {
                "title": "titre de la categorie 1",
                "description": "contenu de la categorie"
            },
            {
                "title": "titre de la categorie 2",
                "description": "contenu de la categorie"
            },
            {
                "title": "titre de la categorie 3",
                "description": "contenu de la categorie"
            }
        ],
        "footer": "made by psyKomicron",
        "title": "Title"
    }
};
let embed = new BotEmbed(json).build();
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