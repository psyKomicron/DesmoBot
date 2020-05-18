# DesmoBot

## Commands
|Name      | Command Syntax                                                                                                                            | Description |
|:--------:|:-----------------------------------------------------------------------------------------------------------------------------------------:|:------------|
| Delete   |`/delete -n [number of messages] -c [channel snowflake/id] -u [discord username (ex: user#1234)]` | Deletes a given number of messages in a given channel. If `-u` is used, deletes only the messages send by the specified user|
| Download |`/download -n [number of files] -c [channel snowflake/id] -t [type of the files] -s [timeout for the http server in seconds]` | Downloads a given number of a given type of files in a given channel. `-s` option is no longer supported|
| Embed    | `/embed -c [channel snowflake/id] [add -d to delete the message after]` | Creates a `MessageEmbed` (look at discordjs documentation) from a json file attached to the message. The channel in wich the message will be sent can be specified & the message can be deleted after execution adding `-d` to the command|
| Help     | `/help` | Shows the help for the differents commands|
| Vote     | `/vote -r/title [title of the vote] -n/timeout [timer for the vote] -c/channel [channel snowflake/id] -m/message [message id/snowflake] ` | Creates a poll/vote. You can set the vote title (`-r/title`), how long the vote will be active (`n/timeout`), where the vote message will be sent (`-c/channel`) or on wich message to create the vote (`-m/message`)|
| Reply    | `/r [message]` & `/r -id [message id/snowflake to quote] -m [message]` | Creates a embed containing a overview of the specified message (`-id`) and the reply (`-m`). If no arguments are given, only a message, the bot will reply to the given message to the last message sent in the channel|

### Vote
The bot creates a poll system using a `Discord.MessageEmbed` and `Discord.ReactionCollector`. Does not support yet a lot of reactions.
- `/vote -n [timeout for the poll in seconds] -c [channel snowflake/id] -r [title of the poll/vote]`
### Delete
The bot deletes a given number of messages in a channel using the channel's `Discord.Snowflake` and can be set to delete a specified user's messages.
- `/delete -n [number of messages] -c [channel snowflake/id] -u [discord username (ex: user#1234)]`
### Download
The bot download a given number of files (type of the files can be specified) in a channel using the channel's `Discord.Snowflake`. When all files are downloaded, a http server is started on localhost to download files remotely. The http server is automatically shutdown after a specified number of seconds.
- `/download -n [number of files] -c [channel snowflake/id] -t [type of the files] -s [timeout for the http server in seconds]`

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
