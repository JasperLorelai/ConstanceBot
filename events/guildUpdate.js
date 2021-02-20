const Client = require("../Client");

Client.on("guildUpdate", (oldGuild, newGuild) => {
    if (oldGuild.available && !newGuild.available) return;
    newGuild.members.fetch().catch(err => console.log("Failed to fetch all members: " + err + "\n" + err.stack));
});
