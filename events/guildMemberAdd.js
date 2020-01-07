const client = require("../bot");
const {config} = client;
client.on("guildMemberAdd", member => {
    const {guild, user} = member;
    const channel = guild.channels.resolve(config.channels.welcome);
    if(!channel) return;
    channel.send(config.embed("User " + user.username + " has joined!", "User " + member.toString() + " has joined the Discord server!\nNew member count: **" + guild.memberCount + "**", config.color.green));
});