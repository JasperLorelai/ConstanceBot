const client = require("../bot");
const {config} = client;
client.on("messageReactionAdd", async (r, u) => {
    const {guild, channel} = r.message;
    // Rule accept.
    if(r.message.id !== config.messages.rules) return;
    if(r.emoji.toString() !== "✅") return;
    // TODO: Remove comment.
    //await guild.members.resolve(u.id).roles.add(config.roles.verified);
    // TODO: Remove comment mid statement.
    await channel.send(config.embed("User " + u.username + " has accepted the rules!", u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + /*guild.roles.resolve(config.roles.verified).members.size + "/"*/ +guild.memberCount + "**."));
});