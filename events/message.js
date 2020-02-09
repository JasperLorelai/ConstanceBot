const client = require("../bot");
client.on("message", async message => {
    // Ignore if the event was handled externally.
    if(message.deleted) return;
    const {content, member, author, client, guild, channel} = message;
    const {commands, config, util, handleMsg} = client;
    let realPrefix = null;
    let prefix = config.globalPrefix;
    if(guild) {
        let db = await client["keyv"].get("guilds");
        if(db && db[guild.id] && db[guild.id].prefix) realPrefix = db[guild.id].prefix;
    }
    if(!content.startsWith(prefix)) {
        if(!guild) {
            await handleMsg(message);
            return;
        }
        // Store whatever prefix is found.
        prefix = realPrefix;
        if(!(prefix && content.startsWith(prefix))) {
            await handleMsg(message);
            return;
        }
    }
    const args = content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    // Execute commands
    const command = commands.get(commandName) || commands.find(cmd => cmd["aliases"] && cmd["aliases"].includes(commandName));
    // "cmd not found, try using ?commands to find your command"
    if(!command) return;
    try {
        if(command.guildOnly && channel.type !== "text") {
            await message.reply("Can't execute that command inside DMs.");
            return;
        }
        if(!await util.getPerms(member, command.perm)) {
            await channel.send(author.toString(), util.embed("No Permission", "You do not have the required permission to execute this command.\n**Required permission:** `" + command.perm + "`", config.color.red));
            return;
        }
        // Run command if all required args are specified.
        if(!command.params || args.length >= command.params.filter(p => p.startsWith("[")).length) command.execute(message, args);
        // Execute help command for command if not.
        else commands.get("help").execute(message, [commandName]);
    } catch(e) {
        await channel.send(author.toString(), util.embed("Error", "Exception during command execution. Full error log was sent to console.", config.color.red));
        console.error(e);
    }
});