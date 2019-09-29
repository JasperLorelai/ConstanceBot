// Importing libraries and functions
const Discord = require("discord.js");
const Keyv = require("keyv");
const fs = require("fs");
const config = require("./files/config.js");

// Creating classes and collections
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.keyv = new Keyv("sqlite://db.sqlite");

// Setting some extra variables
let author;

// Grabbing commands from files and setting them
for(let f of fs.readdirSync('./commands').filter(file => file.endsWith('.js'))) {
    if(f.startsWith("#")) continue;
    const command = require("./commands/" + f);
    client.commands.set(command.name, command);
}

// Listeners
client.login(config.token).catch(e => console.log(e));
client.keyv.on("error", err => console.error("Keyv connection error:", err));

client.on("ready", async () => {
    console.log("Reafy!");
    await client.user.setPresence({activity:{name:" ",type:"WATCHING"}});
    author = client.users.resolve(config.author);
});

client.on("message", async message => {
    // Store whatever prefix is found.
    let prefix = config.globalPrefix;
    if(!message.content.startsWith(prefix)) {
        // Ignore DMs that aren't commands. (this will make DM channels later on)
        if(!message.guild) return;
        prefix = await client.keyv.get("prefix." + message.guild.id);
        // Stop if message doesn't start with a prefix at all.
        if(!message.content.startsWith(prefix)) return null;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    // Execute commands
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd["aliases"] && cmd["aliases"].includes(commandName));
    // "cmd not found, try using ?commands to find your command"
    if(!command) return;
    try {
        const {guildOnly, params, execute} = command;
        if(guildOnly && message.channel.type !== "text") {
            await message.reply("Can't execute that command inside DMs.");
            return;
        }
        // TODO: "Process permissions before executing.
        if(!params || args.length >= params.filter(p => p.startsWith("[")).length) execute(message, args);
        // Execute help command for command if args aren't sufficient for its required parameters.
        else client.commands.get("help").execute(message, [commandName]);
    } catch(e) {
        console.error(e);
        await message.reply("Error during command execution. (error sent to console)");
    }
});