// Importing libraries
require("dotenv").config();
const session = require("express-session");
const Discord = require("discordjs");
const Keyv = require("keyv");
const express = require("express");
const app = express();

app.use(express.static("views"));
app.use(session({
    // Random long string.
    secret: process.env.TRELLO_KEY,
    cookie: {},
    resave: true,
    saveUninitialized: true
}));

// Add custom prototype methods.
require("./files/prototype")(Discord);

// Creating classes and collections
const client = new Discord.Client();
client.fs = require("fs");
client.emojiFile = require("./files/emoji.js");
client.config = require("./files/config.js");
client.util = require("./files/util.js");
client.handleMsg = require("./files/handleMsg.js");
client.keyv = new Keyv(process.env.DATABASE);
client.fetch = require("node-fetch");
client.btoa = require("btoa");
client.atob = require("atob");
client.canvas = require("canvas");
client.ms = require("ms");
client.formData = require("form-data");
client.colorConvert = require("color-convert");
client.sha1 = require("sha1");

// Connect Util and Config.
client.util.config = client.config;
client.config.util = client.util;

client.config.Discord = Discord;

client.login(process.env.BOT_TOKEN).catch(e => console.log(e));
module.exports = client;

const {keyv, fs} = client;

// Grabbing handlers
client.commands = new Discord.Collection();
for (let f of fs.readdirSync("./commands").filter(file => file.endsWith(".js") && !file.startsWith("#"))) {
    const command = require("./commands/" + f);
    client.commands.set(command.name, command);
}
client.app = new Discord.Collection();
for (let f of fs.readdirSync("./app").filter(file => file.endsWith(".js"))) {
    const app = require("./app/" + f);
    client.app.set(f.substr(0, f.length-3), app);
}
client.removeAllListeners();
for (let event of fs.readdirSync("./events").filter(file => file.endsWith(".js"))) {
    require("./events/" + event);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Webserver running on port: " + PORT);
});

keyv.on("error", err => console.error("Keyv connection error:\n", err));

// Add a handler for all application routes.
app.get("/", (request, response) => {
    response.redirect(request.protocol + "://" + request.hostname + "/discord");
});
app.get("/:route", (request, response) => {
    client.webserver = request.protocol + "://" + request.hostname;
    const route = request.params.route;
    if (client.app.has(route)) client.app.get(route)(request, response, client);
    else response.end();
});



// Recheck muted list.
client.setInterval(async () => {
    const db = await keyv.get("guilds");
    if (!db) return;
    for (const guild in client.guilds) {
        if (client.guilds.hasOwnProperty(guild)) {
            if (!db[guild.id]) continue;
            const mutedRole = client.util.findRole("Muted", guild);
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
    }
}, 30000);