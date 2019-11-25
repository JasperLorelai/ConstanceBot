const client = require("../bot");
client.on("message", async message => {
    const {content, member, author, client} = message;
    const {commands, config, keyv, handleMsg} = client;
    let prefix = config.globalPrefix;
    if(!content.startsWith(prefix)) {
        if(!message.guild) {
            // Non command handlers.
            await handleMsg(message);
            return;
        }
        // Store whatever prefix is found.
        prefix = await keyv.get("prefix." + message.guild.id);
        if(!content.startsWith(prefix)) {
            // Non command handlers.
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
        const {guildOnly, params, execute, perm} = command;
        if(guildOnly && message.channel.type !== "text") {
            await message.reply("Can't execute that command inside DMs.");
            return;
        }
        // Process permissions prior to execution.
        const isAuthor = author.id === config.users.author;
        const isAdmin = member ? member.hasPermission("ADMINISTRATOR") : false;
        // Different approach for mods.
        let isMod = false;
        const modRoles = message.guild ? await keyv.get("mod.roles." + message.guild.id) : [];
        if(modRoles) {
            for(let r of modRoles) {
                if(message.guild.roles.has(r)) {
                    isMod = true;
                    break;
                }
            }
        }
        const modUsers = message.guild ? await keyv.get("mod.users." + message.guild.id) : [];
        if(!isMod && modUsers) {
            for(let u of modUsers) {
                // noinspection EqualityComparisonWithCoercionJS
                if(member.id == u) {
                    isMod = true;
                    break;
                }
            }
        }
        let pass = false;
        switch(perm) {
            case "author":
                pass = isAuthor;
                break;
            case "admin":
                pass = isAuthor ? true : isAdmin;
                break;
            case "mod":
                pass = isAuthor ? true : (isAdmin ? true : isMod);
                break;
            case null:
            default:
                pass = true;
                break;
        }
        if(!pass) {
            await message.channel.send(author, config.embed("No Permission", "You do not have the required permission to execute this command.\n**Required permission:** `" + perm + "`", config.color.red));
            return;
        }
        // Run command if all required args are specified.
        if(!params || args.length >= params.filter(p => p.startsWith("[")).length) execute(message, args);
        // Execute help command for command if not.
        else commands.get("help").execute(message, [commandName]);
    } catch(e) {
        console.error(e);
        await message.reply("Error during command execution. (error sent to console)");
    }
});