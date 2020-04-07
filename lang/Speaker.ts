import fs = require('fs');

export class Speaker
{
    private lang: Lang;

    private constructor(lang: Lang)
    {
        this.lang = lang;
        fs.readFileSync(lang);
    }

    public translate(entry: Reply): string
    {
        /*
        switch (entry)
        {
            case: 
            default:
        }
        */
        return entry;
    }

    /**
     * "FR" for french
     * "ENG" for english
     * "IT" for italian
     * @param langType FR | ENG | IT
     */
    public static init(langType: string): Speaker
    {
        switch (langType)
        {
            case "FR":
                return new Speaker(Lang.FR);
                break;
            case "ENG":
                return new Speaker(Lang.ENG);
                break;
            case "IT":
                return new Speaker(Lang.IT);
            default:
        }
    }
}

export enum Reply
{
    WRONG_COMMAND = "Non ho capito, provare con /help ?",
    DL_START = "avvio del download",
}

enum Lang
{
    FR = "./lang/files/lang_fr.txt",
    ENG = "./lang/files/lan_eng.txt",
    IT = "./lang/files/lang_it.txt"
}