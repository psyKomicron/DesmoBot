# DesmoBot
## About (long)
DesmoBot Discord bot, written in TypeScript. Obviously it is using the discord.js API.

For now the bot can download attachements embeded in a message, delete messages in a channel. With both commands you can specify on wich channel the bot will be working, and the number of messages to download/delete. In addition to that the `download` command can download a specific type of file (for now only a few types are available).

## About (short)
discord bot using typescript.

downloads files.

delete messages from a channel (overriding 14 days limitation).

## Dependencies
*all dependencies versions can be newer*
### Dev Dependencies
- nodejs : https://nodejs.org/en/ **v. 13.12.0**
- @types/node : https://www.npmjs.com/package/@types/node `npm install --save @types/node` **v. 13.11.0**
- typescript : https://www.typescriptlang.org/ **v. 3.9.0-dev.20200406**
### Dependencies
- discordjs : https://discord.js.org/#/ or `npm install discord.js` **v. 12.1.1** 
- express : https://expressjs.com/ `npm install --save express` **v. 2.88.2**
- request : https://www.npmjs.com/package/request ***please note that this package has been deprecated*** **v. 2.88.2
- ws : https://www.npmjs.com/package/ws **v. 7.2.3

# Patch notes
## v. 0.1.0
- added `help` command
- added `delete` command
- reworked `download` command
## v. 0.1.1
- reworked download command :
  if the messages are newer than 14 days, then the bot will use the bulkDelete method. If they are older than 14 days, it will manually   delete the messages at a cost of a lower delete speed
