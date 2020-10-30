const Client = require("../Client");
const Libs = require("../Libs");
const {Config, Util, Keyv, handleMsg} = Libs;

Client.on("message", async message => {
    // Ignore if the event was handled externally.
    if (message.deleted) return;
    const Client = message.client;
    const {commands} = Client;
    const {content, author, guild, channel} = message;

    let realPrefix = null;
    let prefix = Config.defaultPrefix;
    if (guild) {
        let db = await Keyv.get("guilds");
        if (db && db[guild.id] && db[guild.id].prefix) realPrefix = db[guild.id].prefix;
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
    const whitelist = command.guildWhitelist;
    if (guild && whitelist && whitelist.length) {
        let passed;
        for (const guildName of whitelist) {
            const data = Config.guildData[guildName];
            if (!data) continue;
            if (data.id !== guild.id) continue;
            passed = true;
            break;
        }
        if (!passed) return;
    }

    // This disables command execution. What sets the channel is in Util -> setMCChannel
    if (Client.minecraftChannels.includes(channel.id)) return;

    if (!await Util.hasPerm(author, guild, command.perm)) {
        await channel.send(author.toString(), Util.embed("No Permission", "You do not have the required permission to execute this command.\n**Required permission:** `" + command.perm + "`", Config.color.red));
        return;
    }
    // Run command if all required args are specified.
    if (!command.params || args.length >= command.params.filter(p => p.startsWith("[")).length) command.execute(Libs, message, args).catchError(channel);
    // Execute help command for command if not.
    else commands.get("help").execute(Libs, message, [commandName]).catchError(channel);
});
