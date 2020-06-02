// Importing libraries
require("dotenv").config();
const session = require("express-session");
const Discord = require("discord.js");
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

// Connect Util and Config.
client.util.config = client.config;
client.config.util = client.util;

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

// Keep the web application online. Has to ping every 20mins.
/*
Not necessary on a "hobby" Dyno.
client.setInterval(async () => {
    await client.fetch("https://constance-bot.herokuapp.com/webAppRefresh");
}, 1000*60*20);
*/
