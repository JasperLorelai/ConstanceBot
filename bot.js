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
const Client = new Discord.Client();
Client.fs = require("fs");
Client.EmojiMap = require("./files/EmojiMap.js");
Client.Config = require("./files/config.js");
Client.Util = require("./files/util.js");
Client.handleMsg = require("./files/handleMsg.js");
Client.keyv = new Keyv(process.env.DATABASE);
Client.fetch = require("node-fetch");
Client.btoa = require("btoa");
Client.atob = require("atob");
Client.canvas = require("canvas");
Client.ms = require("ms");
Client.formData = require("form-data");
Client.colorConvert = require("color-convert");
Client.sha1 = require("sha1");
Client.md5 = require("md5");

// Connect Util and Config.
Client.Util.Config = Client.Config;
Client.Config.Util = Client.Util;

Client.Config.Discord = Discord;
Client.minecraftChannels = [];

Client.login(process.env.BOT_TOKEN).catch(e => console.log(e));
module.exports = Client;

const {keyv, fs} = Client;

// Grabbing handlers
Client.commands = new Discord.Collection();
for (let f of fs.readdirSync("./commands").filter(file => file.endsWith(".js") && !file.startsWith("#"))) {
    const command = require("./commands/" + f);
    Client.commands.set(command.name, command);
}
Client.app = new Discord.Collection();
for (let f of fs.readdirSync("./app").filter(file => file.endsWith(".js"))) {
    const app = require("./app/" + f);
    Client.app.set(f.substr(0, f.length-3), app);
}
Client.removeAllListeners();
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
    Client.webserver = request.protocol + "://" + request.hostname;
    const route = request.params.route;
    if (Client.app.has(route)) Client.app.get(route)(request, response, Client);
    else response.end();
});
app.get("/memberchart/:gist", (request, response) => {
    Client.webserver = request.protocol + "://" + request.hostname;
    Client.app.get("memberchart")(request, response, Client);
});



// Recheck muted list.
Client.setInterval(async () => {
    const db = await keyv.get("guilds");
    if (!db) return;
    for (const guild in Client.guilds) {
        if (Client.guilds.hasOwnProperty(guild)) {
            if (!db[guild.id]) continue;
            const mutedRole = Client.Util.findRole("Muted", guild);
            if (mutedRole && db && db[guild.id] && db[guild.id].muted) {
                const muted = db[guild.id].muted;
                for (const mutedUserID of Object.keys(muted)) {
                    const mutedUser = guild.members.resolve(mutedUserID);
                    if (!mutedUser) {
                        delete db[guild.id].muted[mutedUserID];
                        await keyv.set("guilds", db);
                    }
                    else {
                        if (Date.now() > muted[mutedUserID]) {
                            await mutedUser.roles.remove(mutedRole);
                            await mutedUser.send(Client.Util.embed(guild.name + " - Mute", "Your mute status has been lifted."));
                            delete db[guild.id].muted[mutedUserID];
                            await keyv.set("guilds", db);
                        }
                    }
                }
            }
        }
    }
}, 30000);