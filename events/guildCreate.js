const Client = require("../Client");

Client.on("guildCreate", guild => {
    guild.members.fetch().catch(err => console.log("Failed to fetch all members:" + err + "\n" + err.stack));
});
