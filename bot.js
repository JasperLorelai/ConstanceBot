// Importing libraries and functions
const Discord = require("discord.js");
const Keyv = require("keyv");
const fs = require("fs");
const config = require("./files/config.js");

// Creating classes and collections
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.keyv = new Keyv("sqlite://db.sqlite");

// Grabbing commands from files and setting them
for(let f of fs.readdirSync('./commands').filter(file => file.endsWith('.js'))) {
    if(f.startsWith("#")) continue;
    const command = require("./commands/" + f);
    client.commands.set(command.name, command);
}

// Listeners
const express = require("express");
const app = express();
app.get("/", (request, response) => response.sendStatus(200));
app.listen(process.env.PORT);
client.login(config.token).catch(e => console.log(e));
client.keyv.on("error", err => console.error("Keyv connection error:", err));

client.on("ready", async () => {
    console.log("Reafy!");
    await client.user.setPresence({activity:{name:" ",type:"WATCHING"}});
});

client.on("message", async message => {
    let prefix = config.globalPrefix;
    if(!message.content.startsWith(prefix)) {
        // Ignore DMs that aren't commands. TODO: (this should make DM channels)
        if(!message.guild) return;
        // Store whatever prefix is found.
        prefix = await client.keyv.get("prefix." + message.guild.id);
        if(!message.content.startsWith(prefix)) return null;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    // Execute commands
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd["aliases"] && cmd["aliases"].includes(commandName));
    // "cmd not found, try using ?commands to find your command"
    if(!command) return;
    try {
        const {guildOnly, params, execute, perm} = command;
        if(guildOnly && message.channel.type !== "text") {
            await message.reply("Can't execute that command inside DMs.");
            return;
        }
        // Process permissions prior to execution.
        const member = message.member;
        const isAuthor = member.id === config.author;
        const isAdmin = member.hasPermission("ADMINISTRATOR");
        // Different approach for mods.
        let isMod = false;
        const modRoles = await client.keyv.get("mod.roles." + message.guild.id);
        if(modRoles) {
            for(let r of modRoles) {
                if(member.roles.has(r)) {
                    isMod = true;
                    break;
                }
            }
        }
        const modUsers = await client.keyv.get("mod.users." + message.guild.id);
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
            await message.channel.send(message.author, config.embed(client,"No Permission", "You do not have the required permission to execute this command.\n**Required permission:** `" + perm + "`", "ff0000"));
            return;
        }
        // Run command if all required args are specified.
        if(!params || args.length >= params.filter(p => p.startsWith("[")).length) execute(message, args);
        // Execute help command for command if not.
        else client.commands.get("help").execute(message, [commandName]);
    } catch(e) {
        console.error(e);
        await message.reply("Error during command execution. (error sent to console)");
    }
});