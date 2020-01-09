// Importing libraries
const Discord = require("discord.js");
const Keyv = require("keyv");

// Creating classes and collections
const client = new Discord.Client();
client.fs = require("fs");
client.commands = new Discord.Collection();
client.emoji = require("./files/emoji.js");
client.config = require("./files/config.js");
client.keyv = new Keyv("sqlite://db.sqlite");
client.fetch = require("node-fetch");
client.canvas = require("canvas");
client.handleMsg = require("./files/handleMsg.js");

// Initialising variables
const {config, keyv, fs} = client;

client.login(config.token).catch(e => console.log(e));
module.exports = client;

// Grabbing handlers
for(let f of fs.readdirSync("./commands").filter(file => file.endsWith(".js") && !file.startsWith("#"))) {
    const command = require("./commands/" + f);
    client.commands.set(command.name, command);
}
client.removeAllListeners();
for(let event of fs.readdirSync("./events").filter(file => file.endsWith(".js") && !file.startsWith("#"))) {
    require("./events/" + event);
}
keyv.on("error", err => console.error("Keyv connection error:", err));

// Creating some base methods
String.prototype.toFormalCase = function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
};
String.prototype.discordMKD = function() {
    let splits = this.split("\n").filter(l => l !== "---");
    for(let i = 0; i < splits.length; i++) {
        if(splits[i].startsWith("######") || splits[i].startsWith("#####") || splits[i].startsWith("####") || splits[i].startsWith("###") || splits[i].startsWith("##")) {
            splits[i] = splits[i].replace(/#{2,6}\s?/g, "**") + "**";
        }
        if(splits[i].startsWith("#")) splits[i] = "__**" + splits[i].substr(1) + "**__";
    }
    return splits.join("\n");
};