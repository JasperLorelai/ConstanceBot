// Importing libraries
require("dotenv").config();
const session = require("express-session");
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

// Creating libraries.
const Libs = require("./Libs");
const {fs, Discord, Keyv, Util} = Libs;

// Add custom prototype methods.
for (let prototype of fs.readdirSync("./prototype").filter(file => file.endsWith(".js"))) {
    require("./prototype/" + prototype);
}

// Create client.
const Client = new Discord.Client();
Client.minecraftChannels = [];

Client.login().catch(e => console.log(e));
module.exports = Client;

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

Keyv.on("error", err => console.error("Keyv connection error:\n", err));

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
    const db = await Keyv.get("guilds");
    if (!db) return;
    let edited;
    for (const guild of Client.guilds.cache.values()) {
        if (!db[guild.id]) continue;
        const mutedRole = Util.findRole("Muted", guild);
        if (!(mutedRole && db && db[guild.id] && db[guild.id].muted)) continue;
        const muted = db[guild.id].muted;
        for (const mutedUserID of Object.keys(muted)) {
            const mutedUser = guild.members.resolve(mutedUserID);
            delete db[guild.id].muted[mutedUserID];
            edited = true;
            if (!mutedUser) continue;
            if (Date.now() <= muted[mutedUserID]) continue;
            await mutedUser.roles.remove(mutedRole);
            await mutedUser.send(Util.embed(guild.name + " - Mute", "Your mute status has been lifted.")).catch(() => {});
        }
    }
    await Keyv.set("guilds", db);
}, 60000);
