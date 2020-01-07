const client = require("../bot");
const {config} = client;
client.on("guildMemberRemove", member => {
    const {guild, user} = member;
    const channel = guild.channels.resolve(config.channels.welcome);
    if(!channel) return;
    channel.send(config.embed("User " + user.username + " has left!", "User " + member.toString() + " has left the Discord server!\nNew member count: **" + guild.memberCount + "**", config.color.red));
});