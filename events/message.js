const client = require("../bot");
client.on("message", async message => {
    // Ignore if the event was handled externally.
    if (message.deleted) return;
    const {content, member, author, client, guild, channel} = message;
    const {commands, config, util, handleMsg, keyv} = client;
    let realPrefix = null;
    let prefix = config.defaultPrefix;
    if (guild) {
        let db = await keyv.get("guilds");
        if (db && db[guild.id] && db[guild.id].prefix) realPrefix = db[guild.id].prefix;

        // Recheck muted list.
        const mutedRole = util.findRole("Muted", guild);
        if (mutedRole && db && db[guild.id] && db[guild.id].muted) {
            const muted = db[guild.id].muted;
            for (const mutedUserID of Object.keys(muted)) {
                const mutedUser = guild.members.resolve(mutedUserID);
                if (!mutedUser) {
                    delete db[guild.id].muted[mutedUserID];
                    await keyv.set("guilds", db);
                }
                else {
                    if (new Date().getTime() > muted[mutedUserID]) {
                        await mutedUser.roles.remove(mutedRole);
                        await mutedUser.send(util.embed(guild.name + " - Mute", "Your mute status has been lifted."));
                        delete db[guild.id].muted[mutedUserID];
                        await keyv.set("guilds", db);
                    }
                }
            }
        }
    }
    if (!content.startsWith(prefix)) {
        if (!guild) {
            await handleMsg(message);
            return;
        }
        // Store whatever prefix is found.
        prefix = realPrefix;
        if (!(prefix && content.startsWith(prefix))) {
            await handleMsg(message);
            return;
        }
    }
    const args = content.slice(prefix.length).split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Execute commands
    const command = commands.get(commandName) || commands.find(cmd => cmd["aliases"] && cmd["aliases"].includes(commandName));
    // "cmd not found, try using ?commands to find your command"
    if (!command) return;
    if (command.guildOnly && channel.type !== "text") {
        await message.reply("Can't execute that command inside DMs.");
        return;
    }

    // Check guild whitelist.
    if (command.guildWhitelist && !command.guildWhitelist.includes(guild.id)) return;

    // This disables command execution. What sets the channel is in Util -> setMCChannel
    if (client["minecraft"] && channel.id === client["minecraft"]) return;

    if (!await util.getPerms(member, command.perm)) {
        await channel.send(author.toString(), util.embed("No Permission", "You do not have the required permission to execute this command.\n**Required permission:** `" + command.perm + "`", config.color.red));
        return;
    }
    // Run command if all required args are specified.
    if (!command.params || args.length >= command.params.filter(p => p.startsWith("[")).length) command.execute(message, args);
    // Execute help command for command if not.
    else commands.get("help").execute(message, [commandName]);
});
