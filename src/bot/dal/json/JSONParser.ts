export class JSONParser
{
    /*public checkProperties(json: any, properties: string[]): boolean
    {
        let checked = false;
        let hasAll = false;
        for (let prop in json)
        {
            let jsonRoot = json[prop];
            for (var i = 0; i < properties.length; i++)
            {
                if (!jsonRoot[properties[i]])
                {
                    hasAll = false;
                    console.error("Object doesn't have property " + Printer.error(properties[i]));
                    break;
                }
                else hasAll = true;
            }
            if (hasAll)
            {
                let fields = jsonRoot["fields"];
                for (var j = 0; j < fields.length; j++)
                {
                    if (!fields[j]["title"] || !fields[j]["description"])
                    {
                        checked = false;
                        break;
                    }
                    else checked = true;
                }
            }
            else throw "Given object is malformed";
        }
        return checked;
    }*/

    public static matchTemplate(json: any, template: any): boolean
    {
        let match = false;
        for (let rootName in template)
        {
            let matchingRoot = template[rootName];
            let root = json[rootName];
            if (root != undefined && typeof root == "object")
            {
                match = this.matchTemplate(root, matchingRoot);
                if (!match)
                    break;
            }
            else if (root != undefined)
            {
                match = true;
            }
            else
            {
                match = false;
                break;
            }
        }
        return match;
    }
}