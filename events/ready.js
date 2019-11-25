const client = require("../bot");
client.on("ready", async () => {
    console.log("Reafy!");
    await client.user.setPresence({activity: {name: " ", type: "WATCHING"}});
});