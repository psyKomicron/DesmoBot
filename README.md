# DesmoBot
## About (long)
DesmoBot Discord bot, written in TypeScript. Obviously it is using the discord.js API.

## Functionalities
### Vote
The bot creates a poll system using a `Discord.MessageEmbed` and `Discord.ReactionCollector`. Does not support yet a lot of reactions.
- `/vote -n [timeout for the poll in seconds] -c [channel snowflake/id] -r [title of the poll/vote]`
### Delete
The bot deletes a given number of messages in a channel using the channel's `Discord.Snowflake` and can be set to delete a specified user's messages.
- `/delete -n [number of messages] -c [channel snowflake/id] -u [discord username (ex: user#1234)]`
### Download
The bot download a given number of files (type of the files can be specified) in a channel using the channel's `Discord.Snowflake`. When all files are downloaded, a http server is started on localhost to download files remotely. The http server is automatically shutdown after a specified number of seconds.
- `/download -n [number of files] -c [channel snowflake/id] -t [type of the files] -s [timeout for the http server in seconds]`

## About (short)
discord bot using typescript.

downloads files.

delete messages from a channel (overriding 14 days limitation).

create a poll system.

## Dependencies
*all dependencies versions can be newer*
### Dev Dependencies
- nodejs : https://nodejs.org/en/  **v. 13.12.0**
- @types/node : https://www.npmjs.com/package/@types/node or `npm install --save @types/node`  **v. 13.11.0**
- typescript : https://www.typescriptlang.org/  **v. 3.9.0-dev.20200406**
### Dependencies
- discordjs : https://discord.js.org/#/ or `npm install discord.js`  **v. 12.1.1** 
- express : https://expressjs.com/ or `npm install --save express`  **v. 2.88.2**
- request : https://www.npmjs.com/package/request  ***please note that this package has been deprecated*** **v. 2.88.2**
- ws : https://www.npmjs.com/package/ws  **v. 7.2.3**
